/**
 * applies skinning
 *
 *
 *
 */

import SKINNING from './gl/skinning.glsl';
import {TypedGlNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ShaderName} from '../utils/shaders/ShaderName';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
import {FunctionGLDefinition} from './utils/GLDefinition';

const TEMPLATE = BaseGlShaderAssembler.expandShader(SKINNING);
const TO_REPLACE_INPUT_POS = `vec4( transformed, 1.0 )`;
const TO_REPLACE_INPUT_NORMAL = `vec4( objectNormal, 0.0 )`;
const TO_REPLACE_OUTPUT_POS = `transformed = `;
const TO_REPLACE_OUTPUT_NORMAL = `objectNormal = `;
const TO_REPLACE_OUTPUT_TANGENT = `objectTangent = `;
// const TO_REMOVE = [`#ifdef USE_SKINNING`, '#endif'];

interface CreateFunctionOptions {
	functionName: string;
	structDefinitionName: string;
	// input: string;
	// outValue: string;
}
const ARGS = {
	inputPos: {type: 'vec3', name: 'inputPos'},
	inputNormal: {type: 'vec3', name: 'inputNormal'},
	skinIndex: {type: 'vec4', name: 'skinIndex'},
};
function createFunction(options: CreateFunctionOptions) {
	const skinningStructName = `skinningOut`;
	let withReplaced = TEMPLATE.replace(TO_REPLACE_INPUT_POS, `vec4(${ARGS.inputPos.name}, 1.0)`)
		.replace(TO_REPLACE_INPUT_NORMAL, `vec4(${ARGS.inputNormal.name}, 0.0)`) // CAREFUL: the vec4 w is 0.0, NOT 1.0
		.replace(TO_REPLACE_OUTPUT_POS, `${skinningStructName}.position = `)
		.replace(TO_REPLACE_OUTPUT_NORMAL, `${skinningStructName}.normal = `)
		.replace(TO_REPLACE_OUTPUT_TANGENT, `${skinningStructName}.tangent = `);
	// remove #ifdef USE_SKINNING / #endif
	// for (let toRemove of TO_REMOVE) {
	// 	while (withReplaced.includes(toRemove)) {
	// 		withReplaced = withReplaced.replace(toRemove, '');
	// 	}
	// }
	// add struc
	const structDefinition = `struct ${options.structDefinitionName} {
	vec3 position;
	vec3 normal;
	vec3 tangent;
};`;

	// wrap in a function
	const argsInDefinition = Object.values(ARGS)
		.map((arg) => `${arg.type} ${arg.name}`)
		.join(', ');
	const functionDeclaration = `
${structDefinition}
${options.structDefinitionName} ${options.functionName}(${argsInDefinition}){
${options.structDefinitionName} ${skinningStructName};
${withReplaced}
return ${skinningStructName};
}`;

	return {functionDeclaration};
}

enum SkinningOutput {
	POSITION = 'position',
	NORMAL = 'normal',
	TANGENT = 'tangent',
}

class SkinningGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	normal = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new SkinningGlParamsConfig();
export class SkinningGlNode extends TypedGlNode<SkinningGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'skinning'> {
		return 'skinning';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(SkinningOutput.POSITION, GlConnectionPointType.VEC3),
			new GlConnectionPoint(SkinningOutput.NORMAL, GlConnectionPointType.VEC3),
			new GlConnectionPoint(SkinningOutput.TANGENT, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(linesController: ShadersCollectionController) {
		if (linesController.currentShaderName() == ShaderName.VERTEX) {
			const inputPosition = ThreeToGl.vector3(this.variableForInputParam(this.p.position));
			const inputNormal = ThreeToGl.vector3(this.variableForInputParam(this.p.normal));
			const outPosition = this.glVarName(SkinningOutput.POSITION);
			const outNormal = this.glVarName(SkinningOutput.NORMAL);
			const outTangent = this.glVarName(SkinningOutput.TANGENT);
			const outValue = this.glVarName('out');
			const functionName = `computeSkinningData_${this.graphNodeId()}`;
			const structDefinitionName = `SkinningData_${this.graphNodeId()}`;
			const {functionDeclaration} = createFunction({functionName, structDefinitionName});
			const bodyLines: string[] = [
				`#ifdef USE_SKINNING`,
				`${structDefinitionName} ${outValue} = ${functionName}(${inputPosition}, ${inputNormal}, ${ARGS.skinIndex.name})`,
				`vec3 ${outPosition} = ${outValue}.position;`,
				`vec3 ${outNormal} = ${outValue}.normal;`,
				`vec3 ${outTangent} = ${outValue}.tangent;`,
				`#else`,
				`vec3 ${outPosition} = ${inputPosition}`,
				`vec3 ${outNormal} = ${inputNormal}`,
				`vec3 ${outTangent} = vec3(0.)`,
				`#endif`,
			];
			const definitionLines: FunctionGLDefinition[] = [];
			definitionLines.push(new FunctionGLDefinition(this, functionDeclaration));
			linesController.addBodyLines(this, bodyLines, ShaderName.VERTEX);
			linesController.addDefinitions(this, definitionLines);
		}
	}
}
