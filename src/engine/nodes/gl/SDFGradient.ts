/**
 * computes the gradient of an SDF function
 *
 * @remarks
 *
 * The SDF function can be generated from nodes created inside this node.
 *
 *
 * The computation is based on [https://www.iquilezles.org/www/articles/normalsSDF/normalsSDF.htm](https://www.iquilezles.org/www/articles/normalsSDF/normalsSDF.htm)
 */

import {TypedSubnetGlNode, TypedSubnetGlParamsConfigMixin} from './Subnet';
import {GlConnectionPointType, GL_CONNECTION_POINT_TYPES} from '../utils/io/connections/Gl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {LineType} from './code/utils/LineType';
import {SubnetOutputGlNode} from './SubnetOutput';
import {SubnetInputGlNode} from './SubnetInput';
import {GlType} from '../../poly/registers/nodes/types/Gl';

const POSITION_INPUT_NAME = 'position';
const GRADIENT_OUTPUT_NAME = 'gradient';
const SDF_OUTPUT_NAME = 'sdf';
const GRADIENT_FUNCTION_NAME = 'gradientFunction';
const SDF_FUNCTION_NAME = 'sdfFunction';

interface GradientFunctionOptions {
	epsilon: number;
	gradientFunctionName: string;
	sdfFunctionName: string;
	additionalArguments: string[];
}
interface FunctionArguments {
	definition: string[];
	call: string[];
}
interface FunctionOptions {
	name: {
		sdf: string;
		gradient: string;
	};
	arguments: FunctionArguments;
}

function gradientFunction(options: GradientFunctionOptions) {
	const {sdfFunctionName, gradientFunctionName, epsilon, additionalArguments} = options;
	// we remove position, since it's already there
	additionalArguments.shift();
	const otherArgsDefinition = additionalArguments.length > 0 ? `, ${additionalArguments.join(', ')}` : '';
	const otherArgsWithoutGlType = additionalArguments.map((arg) => {
		const elements = arg.split(' ');
		return elements[elements.length - 1];
	});
	const otherArgsCall = otherArgsWithoutGlType.length > 0 ? `, ${otherArgsWithoutGlType.join(', ')}` : '';
	const functionDefinition = `
vec3 ${gradientFunctionName}( in vec3 p${otherArgsDefinition} )
{
	const float eps = ${epsilon};
	const vec2 h = vec2(eps,0);
	return normalize(
		vec3(
			${sdfFunctionName}(p+h.xyy${otherArgsCall}) - ${sdfFunctionName}(p-h.xyy${otherArgsCall}),
			${sdfFunctionName}(p+h.yxy${otherArgsCall}) - ${sdfFunctionName}(p-h.yxy${otherArgsCall}),
			${sdfFunctionName}(p+h.yyx${otherArgsCall}) - ${sdfFunctionName}(p-h.yyx${otherArgsCall})
		)
	);
}
`;

	return functionDefinition;
}

class SDFGradientGlParamsConfig extends TypedSubnetGlParamsConfigMixin(NodeParamsConfig) {
	epsilon = ParamConfig.FLOAT(0.0001, {
		range: [0.000000001, 1],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new SDFGradientGlParamsConfig();

export class SDFGradientGlNode extends TypedSubnetGlNode<SDFGradientGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<GlType.SDF_GRADIENT> {
		return GlType.SDF_GRADIENT;
	}

	protected override _expectedInputsCount() {
		return super._expectedInputsCount() + 1;
	}
	protected override _expectedInputTypes(): GlConnectionPointType[] {
		return [GlConnectionPointType.VEC3].concat(super._expectedInputTypes());
	}
	protected override _expectedOutputTypes() {
		return [GlConnectionPointType.FLOAT, GlConnectionPointType.VEC3];
	}
	protected override _expectedInputName(index: number) {
		if (index == 0) {
			return POSITION_INPUT_NAME;
		} else {
			return super._expectedInputName(index - 1);
		}
	}
	protected override _expectedOutputName(index: number) {
		return [SDF_OUTPUT_NAME, GRADIENT_OUTPUT_NAME][index];
	}
	override childExpectedOutputConnectionPointTypes() {
		return [GlConnectionPointType.FLOAT];
	}
	override childExpectedOutputConnectionPointName(index: number) {
		return SDF_OUTPUT_NAME;
	}

	//
	//
	// set_lines
	//
	//
	override setSubnetInputLines(
		shadersCollectionController: ShadersCollectionController,
		childNode: SubnetInputGlNode
	) {
		const bodyLines: string[] = [];

		// add position, always
		const position = childNode.glVarName(POSITION_INPUT_NAME);
		bodyLines.push(`	vec3 ${position} = ${POSITION_INPUT_NAME}`);

		// add subsequent inputs
		const otherInputsCount = this.pv.inputsCount;
		for (let i = 0; i < otherInputsCount; i++) {
			const inputName = this._inputNameParams()[i].value;
			const varName = childNode.glVarName(inputName);
			const glType = GL_CONNECTION_POINT_TYPES[this._inputTypeParams()[i].value];
			bodyLines.push(`	${glType} ${varName} = ${inputName}`);
		}

		shadersCollectionController.addBodyLines(childNode, bodyLines);
	}
	override setSubnetOutputLines(
		shadersCollectionController: ShadersCollectionController,
		childNode: SubnetOutputGlNode
	) {
		const connections = childNode.io.connections.inputConnections();
		const connection = connections ? connections[0] : null;
		if (!connection) {
			shadersCollectionController.addBodyLines(childNode, [`return 0.0`]);
			return;
		}

		const connectionPoint = connection.destConnectionPoint();
		const inValue = ThreeToGl.any(childNode.variableForInput(connectionPoint.name()));
		const bodyLine = `return ${inValue}`;
		shadersCollectionController.addBodyLines(childNode, [bodyLine]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const functionArguments: FunctionArguments = {
			definition: [],
			call: [],
		};
		// add position, always
		const position = ThreeToGl.any(this.variableForInput(POSITION_INPUT_NAME));
		functionArguments.definition.push(`vec3 ${POSITION_INPUT_NAME}`);
		functionArguments.call.push(position);

		// add subsequent inputs
		const otherInputsCount = this.pv.inputsCount;
		for (let i = 0; i < otherInputsCount; i++) {
			const inputName = this._inputNameParams()[i].value;
			const glType = GL_CONNECTION_POINT_TYPES[this._inputTypeParams()[i].value];
			const inputVal = ThreeToGl.any(this.variableForInput(inputName));
			functionArguments.definition.push(`${glType} ${inputName}`);
			functionArguments.call.push(inputVal);
		}

		const options: FunctionOptions = {
			name: {
				sdf: this.glVarName(SDF_FUNCTION_NAME),
				gradient: this.glVarName(GRADIENT_FUNCTION_NAME),
			},
			arguments: functionArguments,
		};

		this._declareFunctions(shadersCollectionController, options);

		this._callFunctions(shadersCollectionController, options);
	}
	private _declareFunctions(shadersCollectionController: ShadersCollectionController, options: FunctionOptions) {
		const codeBuilder = this._runCodeBuilder(shadersCollectionController);
		if (!codeBuilder) {
			return;
		}
		const shadername = shadersCollectionController.currentShaderName();
		const bodyLines = codeBuilder.lines(shadername, LineType.BODY);

		const sdfFunctionLines: string = [
			`float ${options.name.sdf}(${options.arguments.definition.join(', ')}){`,
			...this._sanitizeBodyLines(bodyLines),
			`}`,
		].join('\n');
		const gradientFunctionLines = gradientFunction({
			epsilon: this.pv.epsilon,
			sdfFunctionName: options.name.sdf,
			gradientFunctionName: options.name.gradient,
			additionalArguments: options.arguments.definition,
		});
		shadersCollectionController.addDefinitions(this, [
			new FunctionGLDefinition(this, sdfFunctionLines),
			new FunctionGLDefinition(this, gradientFunctionLines),
		]);
	}
	private _callFunctions(shadersCollectionController: ShadersCollectionController, options: FunctionOptions) {
		const used_output_names = this.io.outputs.used_output_names();
		const bodyLines: string[] = [];
		if (used_output_names.indexOf(SDF_OUTPUT_NAME) >= 0) {
			const varName = this.glVarName(SDF_OUTPUT_NAME);
			bodyLines.push(`float ${varName} = ${options.name.sdf}(${options.arguments.call.join(', ')})`);
		}
		if (used_output_names.indexOf(GRADIENT_OUTPUT_NAME) >= 0) {
			const varName = this.glVarName(GRADIENT_OUTPUT_NAME);
			bodyLines.push(`vec3 ${varName} = ${options.name.gradient}(${options.arguments.call.join(', ')})`);
		}
		shadersCollectionController.addBodyLines(this, bodyLines);
	}
}
