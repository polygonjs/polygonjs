/**
 * transforms an input color (vec3) from LAB color space to RGB
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';

import ColorGlslLib from './gl/color.glsl';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'rgb';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class LabToRgbGlParamsConfig extends NodeParamsConfig {
	lab = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new LabToRgbGlParamsConfig();
export class LabToRgbGlNode extends TypedGlNode<LabToRgbGlParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'lab_to_rgb';
	}

	initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	setLines(shaders_collection_controller: ShadersCollectionController) {
		const function_declaration_lines = [];
		const body_lines = [];

		function_declaration_lines.push(new FunctionGLDefinition(this, ColorGlslLib));

		const value = ThreeToGl.vector3(this.variableForInputParam(this.p.lab));

		const rgb = this.glVarName(OUTPUT_NAME);
		// body_lines.push(
		// 	`vec3 ${rgb} = labToRgb(vec3(${value}.x*100.0, (${value}.y-0.5)*(2.0*128.0), (${value}.z-0.5)*(2.0*128.0) ))`
		// );
		body_lines.push(`vec3 ${rgb} = labToRgb(vec3(${value}.x*100.0, -128.0, 128.0 ))`);
		shaders_collection_controller.addDefinitions(this, function_declaration_lines);
		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
