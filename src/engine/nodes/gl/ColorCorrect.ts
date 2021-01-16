import {TypedGlNode} from './_Base';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';

export enum ColorCorrectType {
	LINEAR = 'Linear',
	GAMMA = 'Gamma',
	SRGB = 'sRGB',
	RGBE = 'RGBE',
	RGBM = 'RGBM',
	RGBD = 'RGBD',
	LogLuv = 'LogLuv',
}
const TYPES: Array<ColorCorrectType> = [
	ColorCorrectType.LINEAR,
	ColorCorrectType.GAMMA,
	ColorCorrectType.SRGB,
	ColorCorrectType.RGBE,
	ColorCorrectType.RGBM,
	ColorCorrectType.RGBD,
	ColorCorrectType.LogLuv,
];

import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';

class ColorCorrectParamsConfig extends NodeParamsConfig {
	color = ParamConfig.VECTOR4([1, 1, 1, 1]);
	from = ParamConfig.INTEGER(TYPES.indexOf(ColorCorrectType.LINEAR), {
		menu: {
			entries: TYPES.map((type, i) => {
				return {name: type, value: i};
			}),
		},
	});
	to = ParamConfig.INTEGER(TYPES.indexOf(ColorCorrectType.GAMMA), {
		menu: {
			entries: TYPES.map((type, i) => {
				return {name: type, value: i};
			}),
		},
	});
	gamma_factor = ParamConfig.FLOAT(2.2);
}

const ParamsConfig = new ColorCorrectParamsConfig();
export class ColorCorrectGlNode extends TypedGlNode<ColorCorrectParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'colorCorrect';
	}
	static INPUT_NAME = 'color';
	static INPUT_GAMMA_FACTOR = 'gamma_factor';
	static OUTPUT_NAME = 'out';
	initializeNode() {
		this.io.connection_points.spare_params.set_inputless_param_names(['to', 'from']);
		this.io.outputs.set_named_output_connection_points([
			new GlConnectionPoint(ColorCorrectGlNode.OUTPUT_NAME, GlConnectionPointType.VEC4),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const from = TYPES[this.pv.from];
		const to = TYPES[this.pv.to];
		const out = this.gl_var_name(ColorCorrectGlNode.OUTPUT_NAME);
		const arg_in = ThreeToGl.any(this.variable_for_input(ColorCorrectGlNode.INPUT_NAME));
		const body_lines: string[] = [];
		if (from != to) {
			const method_name = `${from}To${to}`;
			const args: string[] = [];
			args.push(arg_in);

			if (from == ColorCorrectType.GAMMA || to == ColorCorrectType.GAMMA) {
				const arg_gamma_factor = ThreeToGl.any(this.variable_for_input(ColorCorrectGlNode.INPUT_GAMMA_FACTOR));
				args.push(arg_gamma_factor);
			}

			body_lines.push(`vec4 ${out} = ${method_name}(${args.join(', ')})`);
		} else {
			body_lines.push(`vec4 ${out} = ${arg_in}`);
		}
		shaders_collection_controller.add_body_lines(this, body_lines);
	}
}
