import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';

import Hsv2Rgb from './gl/hsv2rgb.glsl';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'rgb';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class HsvToRgbGlParamsConfig extends NodeParamsConfig {
	hsv = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new HsvToRgbGlParamsConfig();
export class HsvToRgbGlNode extends TypedGlNode<HsvToRgbGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'hsvToRgb';
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

		function_declaration_lines.push(new FunctionGLDefinition(this, Hsv2Rgb));

		const value = ThreeToGl.vector3(this.variable_for_input(this.p.hsv.name()));

		const rgb = this.glVarName(OUTPUT_NAME);
		body_lines.push(`vec3 ${rgb} = hsv2rgb(${value})`);
		shaders_collection_controller.addDefinitions(this, function_declaration_lines);
		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
