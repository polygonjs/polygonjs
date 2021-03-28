import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';

import Rgb2Hsv from './gl/rgb2hsv.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const OUTPUT_NAME = 'hsv';
class RgbToHsvGlParamsConfig extends NodeParamsConfig {
	rgb = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new RgbToHsvGlParamsConfig();
export class RgbToHsvGlNode extends TypedGlNode<RgbToHsvGlParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'rgbToHsv';
	}

	initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	setLines(shaders_collection_controller: ShadersCollectionController) {
		const function_declaration_lines = [];
		const body_lines = [];

		function_declaration_lines.push(new FunctionGLDefinition(this, Rgb2Hsv));

		const rgb = ThreeToGl.vector3(this.variableForInputParam(this.p.rgb));

		const hsv = this.glVarName(OUTPUT_NAME);
		body_lines.push(`vec3 ${hsv} = rgb2hsv(${rgb})`);
		shaders_collection_controller.addDefinitions(this, function_declaration_lines);
		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
