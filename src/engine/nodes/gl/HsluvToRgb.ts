import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';

import ColorGlslLib from './gl/color.glsl';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'rgb';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class LabToRgbGlParamsConfig extends NodeParamsConfig {
	hsluv = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new LabToRgbGlParamsConfig();
export class HsluvToRgbGlNode extends TypedGlNode<LabToRgbGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'hsluvToRgb';
	}

	initializeNode() {
		super.initializeNode();

		this.io.outputs.set_named_output_connection_points([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const function_declaration_lines = [];
		const body_lines = [];

		function_declaration_lines.push(new FunctionGLDefinition(this, ColorGlslLib));

		const value = ThreeToGl.vector3(this.variable_for_input(this.p.hsluv.name()));

		const rgb = this.gl_var_name(OUTPUT_NAME);
		body_lines.push(`vec3 ${rgb} = hsluvToRgb(${value}.x * 360.0, ${value}.y * 100.0, ${value}.z * 100.0)`);
		shaders_collection_controller.add_definitions(this, function_declaration_lines);
		shaders_collection_controller.add_body_lines(this, body_lines);
	}
}
