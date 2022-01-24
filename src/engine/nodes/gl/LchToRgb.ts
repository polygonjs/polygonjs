/**
 * transforms an input color (vec3) from LCH color space to RGB
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';

import ColorGlslLib from './gl/color.glsl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'rgb';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
class LchToRgbGlParamsConfig extends NodeParamsConfig {
	lch = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new LchToRgbGlParamsConfig();
export class LchToRgbGlNode extends TypedGlNode<LchToRgbGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'lch_to_rgb';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const function_declaration_lines = [];
		const body_lines = [];

		function_declaration_lines.push(new FunctionGLDefinition(this, ColorGlslLib));

		const value = ThreeToGl.vector3(this.variableForInputParam(this.p.lch));

		const rgb = this.glVarName(OUTPUT_NAME);
		body_lines.push(`vec3 ${rgb} = lchToRgb(${value})`);
		shaders_collection_controller.addDefinitions(this, function_declaration_lines);
		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
