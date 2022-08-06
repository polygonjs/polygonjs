import {GlType} from './../../poly/registers/nodes/types/Gl';
import {ParamConfig} from './../utils/params/ParamsConfig';
import {FunctionGLDefinition} from './utils/GLDefinition';
/**
 * Creates an SDF material
 *
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

// const INPUT_NAME = {
// 	COLOR: 'color',
// };
const OUTPUT_NAME = GlType.SDF_MATERIAL;
class SDFMaterialGlParamsConfig extends NodeParamsConfig {
	color = ParamConfig.COLOR([1, 1, 1]);
}
const ParamsConfig = new SDFMaterialGlParamsConfig();
export class SDFMaterialGlNode extends TypedGlNode<SDFMaterialGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.SDF_MATERIAL;
	}

	override initializeNode() {
		super.initializeNode();
		// this.io.connection_points.spare_params.setInputlessParamNames(['color']);
		// this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		// this.io.connection_points.set_input_name_function(this._glInputNames.bind(this));
		// this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		// this.io.connection_points.set_output_name_function(this._glOutputNames.bind(this));
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.SDF_MATERIAL),
		]);
	}
	// private _expectedInputTypes() {
	// 	return [GlConnectionPointType.VEC3];
	// }
	// private _expectedOutputTypes() {
	// 	return [GlConnectionPointType.SDF_MATERIAL];
	// }
	// private _glInputNames(i: number) {
	// 	return [INPUT_NAME.COLOR][i];
	// }
	// private _glOutputNames(i: number) {
	// 	return [OUTPUT_NAME][i];
	// }
	materialIdName() {
		return this.path().replace(/\//g, '_').toUpperCase();
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const color = ThreeToGl.vector3(this.variableForInputParam(this.p.color));
		const matId = this.graphNodeId();
		const matIdName = this.materialIdName();
		// const matIdVarName = this.glVarName(OUTPUT_NAME);
		// const functionName = `applySDFMaterial_${matIdName}`;

		// const functionDeclaration = `vec3 ${functionName}(){
		// 	return ${color};
		// }`;
		const defineDeclaration = `const int ${matIdName} = ${matId};`;

		// shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, functionDeclaration)]);
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, defineDeclaration)]);

		const body_line = `if(mat == ${matIdName}){
			col *= ${color};
		}`;
		shadersCollectionController.addBodyLines(this, [body_line]);
	}
}
