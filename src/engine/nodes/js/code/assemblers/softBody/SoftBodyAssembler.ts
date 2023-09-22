import {
	BaseJsShaderAssembler,
	INSERT_DEFINE_AFTER,
	INSERT_BODY_AFTER,
	INSERT_MEMBERS_AFTER,
	INSERT_CONSTRUCTOR_AFTER,
	VelocityColliderFunctionData,
	SpareParamOptions,
} from '../_Base';
import {RegisterableVariable} from '../_BaseJsPersistedConfigUtils';
import {ThreeToGl} from '../../../../../../core/ThreeToGl';
import {JsShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';
import {JsFunctionName} from '../../../../utils/shaders/ShaderName';
import {OutputJsNode} from '../../../Output';
import {GlobalsJsNode} from '../../../Globals';
import {JsConnectionPointType, JsConnectionPoint} from '../../../../utils/io/connections/Js';
import {JsLinesCollectionController} from '../../utils/JsLinesCollectionController';
import {Vector3} from 'three';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {ParamOptions} from '../../../../../params/utils/OptionsController';
import {PrettierController} from '../../../../../../core/code/PrettierController';

export enum SoftBodyVariable {
	P = 'position',
	V = 'velocity',
	COLLISION_SDF = 'collisionSDF',
	//
	TIME = 'time',
	DELTA = 'delta',
}

const TEMPLATE_VELOCITY = `
${INSERT_DEFINE_AFTER}
${INSERT_MEMBERS_AFTER}
${INSERT_CONSTRUCTOR_AFTER}
const SoftBodyVelocity = function(){
	${INSERT_BODY_AFTER}
`;
const CLOSE_CLASS_DEFINITION_VELOCITY = `};
return SoftBodyVelocity;`;

const TEMPLATE_COLLIDER = `
${INSERT_DEFINE_AFTER}
${INSERT_MEMBERS_AFTER}
${INSERT_CONSTRUCTOR_AFTER}
const SoftBodyCollider = function(){
	${INSERT_BODY_AFTER}
`;
const CLOSE_CLASS_DEFINITION_COLLIDER = `};
return SoftBodyCollider;`;

export class JsAssemblerSoftBody extends BaseJsShaderAssembler {
	makeFunctionNodeDirtyOnChange() {
		return true;
	}
	defaultObject3DVariable(): string {
		return 'null';
	}
	defaultObject3DMaterialVariable(): string {
		return 'null';
	}
	defaultPointIndexVariable(): string {
		return 'null';
	}
	override templateShader() {
		return {
			velocity: TEMPLATE_VELOCITY,
			collider: TEMPLATE_COLLIDER,
		};
	}

	override spareParamsOptions(options: SpareParamOptions) {
		const _options: ParamOptions = {
			spare: true,
			// computeOnDirty: true, // not needed if cook option is not set
			cook: false, // for Softbody, the node must not recook
			// important for texture nodes
			// that compute after being found by the nodepath param
			dependentOnFoundNode: true,
		};
		return _options;
	}

	functionData(): VelocityColliderFunctionData | undefined {
		const _buildFunctionBody = (functionName: JsFunctionName, closeDef: string) => {
			const bodyLines = this._shaders_by_name.get(functionName) || TEMPLATE_VELOCITY;
			const functionBodyElements = [
				bodyLines,
				// triggerableFunctionLines.join('\n'),
				// triggerFunctionLines.join('\n'),
				closeDef,
			];
			const functionBody = PrettierController.formatJs(functionBodyElements.join('\n'));
			return functionBody;
		};

		const functionBodyVelocity = _buildFunctionBody(JsFunctionName.VELOCITY, CLOSE_CLASS_DEFINITION_VELOCITY);
		const functionBodyCollider = _buildFunctionBody(JsFunctionName.COLLIDER, CLOSE_CLASS_DEFINITION_COLLIDER);
		if (!(functionBodyVelocity && functionBodyCollider)) {
			return;
		}
		const variableNames: string[] = [];
		const functionNames: Array<keyof NamedFunctionMap> = [];
		const variablesByName: Record<string, RegisterableVariable> = {};
		const functionsByName: Record<string, Function> = {};
		this.traverseRegisteredVariables((variable, varName) => {
			variableNames.push(varName);
			variablesByName[varName] = variable;
		});
		this.traverseRegisteredFunctions((namedFunction) => {
			functionNames.push(namedFunction.type() as keyof NamedFunctionMap);
			functionsByName[namedFunction.type()] = namedFunction.func.bind(namedFunction);
		});
		const paramConfigs = this.param_configs();
		return {
			functionBody: {
				velocity: functionBodyVelocity,
				collider: functionBodyCollider,
			},
			variableNames,
			variablesByName,
			functionNames,
			functionsByName,
			paramConfigs: [...paramConfigs],
		};
	}

	override updateFunction() {
		super.updateFunction();
		this._lines = new Map();
		this._shaders_by_name = new Map();
		const shaderNames = this.shaderNames();

		if (this._root_nodes.length > 0) {
			this.buildCodeFromNodes(this._root_nodes);
			this._buildLines();
		}

		for (const shaderName of shaderNames) {
			const lines = this._lines.get(shaderName);
			if (lines) {
				this._shaders_by_name.set(shaderName, lines.join('\n'));
			}
		}
	}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	override add_output_inputs(output_child: OutputJsNode) {
		output_child.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(SoftBodyVariable.V, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(SoftBodyVariable.COLLISION_SDF, JsConnectionPointType.FLOAT),
		]);
	}
	override add_globals_outputs(globals_node: GlobalsJsNode) {
		globals_node.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(SoftBodyVariable.P, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(SoftBodyVariable.V, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(SoftBodyVariable.TIME, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(SoftBodyVariable.DELTA, JsConnectionPointType.FLOAT),
		]);
	}

	//
	//
	// CONFIGS
	//
	//
	override create_shader_configs() {
		return [
			new JsShaderConfig(JsFunctionName.VELOCITY, [SoftBodyVariable.V], []),
			new JsShaderConfig(JsFunctionName.COLLIDER, [SoftBodyVariable.COLLISION_SDF], []),
		];
	}
	override create_variable_configs() {
		return [
			new VariableConfig(SoftBodyVariable.V, {
				prefix: 'return ',
			}),
			new VariableConfig(SoftBodyVariable.COLLISION_SDF, {
				prefix: 'return ',
			}),
		];
	}

	override setNodeLinesOutput(outputNode: OutputJsNode, linesController: JsLinesCollectionController) {
		const inputNames = this.inputNamesForShaderName(
			outputNode,
			linesController.currentShaderName()
		) as SoftBodyVariable[];
		if (inputNames) {
			for (const inputName of inputNames) {
				const input = outputNode.io.inputs.named_input(inputName);
				const glVar = outputNode.variableForInput(linesController, inputName);
				switch (inputName) {
					case SoftBodyVariable.V: {
						const _defaultVar = () => {
							const tmpVarName = linesController.addVariable(outputNode, new Vector3(0, 0.1, 0));
							return `return ${tmpVarName}`;
						};
						const bodyLine = input ? `return ${ThreeToGl.any(glVar)}` : _defaultVar();
						linesController._addBodyLines(outputNode, [bodyLine]);
						break;
					}
					case SoftBodyVariable.COLLISION_SDF: {
						const bodyLine = input ? `return ${ThreeToGl.any(glVar)}` : `return 100`;
						linesController._addBodyLines(outputNode, [bodyLine]);
						break;
					}
				}
			}
		}
	}

	override setNodeLinesGlobals(globalsNode: GlobalsJsNode, shadersCollectionController: JsLinesCollectionController) {
		const shaderName = shadersCollectionController.currentShaderName();
		const shaderConfig = this.shader_config(shaderName);
		if (!shaderConfig) {
			return;
		}
		const bodyLines: string[] = [];

		const usedOutputNames = globalsNode.io.outputs.used_output_names();
		for (const outputName of usedOutputNames) {
			const varName = globalsNode.jsVarName(outputName);

			switch (outputName) {
				case 'position': {
					shadersCollectionController.addVariable(globalsNode, new Vector3(), varName);
					bodyLines.push(`${varName}.copy(${outputName})`);
					break;
				}
				case SoftBodyVariable.V: {
					shadersCollectionController.addVariable(globalsNode, new Vector3(), varName);
					bodyLines.push(`${varName}.copy(${outputName})`);
					break;
				}
				case SoftBodyVariable.TIME: {
					bodyLines.push(`const ${varName} = ${SoftBodyVariable.TIME}`);
					break;
				}
				case SoftBodyVariable.DELTA: {
					bodyLines.push(`const ${varName} = ${SoftBodyVariable.DELTA}`);
					break;
				}
			}
		}
		shadersCollectionController._addBodyLines(globalsNode, bodyLines);
	}
}
