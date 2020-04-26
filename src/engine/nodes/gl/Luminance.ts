import {TypedGlNode} from './_Base';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const OUTPUT_NAME = 'lum';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class LuminanceGlParamsConfig extends NodeParamsConfig {
	hsv = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new LuminanceGlParamsConfig();
export class LuminanceGlNode extends TypedGlNode<LuminanceGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'luminance';
	}

	initialize_node() {
		super.initialize_node();

		this.io.outputs.set_named_output_connection_points([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const value = ThreeToGl.vector3(this.variable_for_input('color'));

		const lum = this.gl_var_name('lum');
		// linearToRelativeLuminance is declared in threejs common.glsl.js
		const body_line = `float ${lum} = linearToRelativeLuminance(${value})`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
