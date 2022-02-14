/**
 * applies a color correction
 *
 *
 */

import {TypedGlNode} from './_Base';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import ColorGlslLib from './gl/color.glsl';

export enum ColorCorrectType {
	LINEAR = 'Linear',
	SRGB = 'sRGB',
}
const TYPES: Array<ColorCorrectType> = [ColorCorrectType.LINEAR, ColorCorrectType.SRGB];

import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FunctionGLDefinition} from './utils/GLDefinition';

class ColorCorrectParamsConfig extends NodeParamsConfig {
	color = ParamConfig.VECTOR4([1, 1, 1, 1]);
	from = ParamConfig.INTEGER(TYPES.indexOf(ColorCorrectType.LINEAR), {
		menu: {
			entries: TYPES.map((type, i) => {
				return {name: type, value: i};
			}),
		},
	});
	to = ParamConfig.INTEGER(TYPES.indexOf(ColorCorrectType.SRGB), {
		menu: {
			entries: TYPES.map((type, i) => {
				return {name: type, value: i};
			}),
		},
	});
}

const ParamsConfig = new ColorCorrectParamsConfig();
export class ColorCorrectGlNode extends TypedGlNode<ColorCorrectParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'colorCorrect';
	}
	static INPUT_NAME = 'color';
	static OUTPUT_NAME = 'out';
	override initializeNode() {
		this.io.connection_points.spare_params.set_inputless_param_names(['to', 'from']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(ColorCorrectGlNode.OUTPUT_NAME, GlConnectionPointType.VEC4),
		]);
	}
	colorSpaces() {
		return {
			from: TYPES[this.pv.from],
			to: TYPES[this.pv.to],
		};
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const {from, to} = this.colorSpaces();
		const out = this.glVarName(ColorCorrectGlNode.OUTPUT_NAME);
		const arg_in = ThreeToGl.any(this.variableForInput(ColorCorrectGlNode.INPUT_NAME));
		const body_lines: string[] = [];
		if (from != to) {
			const method_name = `${from}To${to}`;
			const args: string[] = [];
			args.push(arg_in);

			body_lines.push(`vec4 ${out} = ${method_name}(${args.join(', ')})`);
		} else {
			body_lines.push(`vec4 ${out} = ${arg_in}`);
		}
		shaders_collection_controller.addBodyLines(this, body_lines);
		shaders_collection_controller.addDefinitions(this, [new FunctionGLDefinition(this, ColorGlslLib)]);
	}
}
