/**
 * transforms an input color (vec3) from RGB color space to Oklab
 *
 *
 *  @remarks
 * 
 * This is using the algorithm from Inigo Quilez's https://www.shadertoy.com/view/WtccD7, which is implenting Björn Ottosson's
 https://bottosson.github.io/posts/oklab/
 *
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';

import oklab from './gl/oklab.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const OUTPUT_NAME = 'oklab';
class RgbToOklabGlParamsConfig extends NodeParamsConfig {
	rgb = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new RgbToOklabGlParamsConfig();
export class RgbToOklabGlNode extends TypedGlNode<RgbToOklabGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'rgbToOklab';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const function_declaration_lines = [];
		const body_lines = [];

		function_declaration_lines.push(new FunctionGLDefinition(this, oklab));

		const rgb = ThreeToGl.vector3(this.variableForInputParam(this.p.rgb));

		const oklabOut = this.glVarName(OUTPUT_NAME);
		body_lines.push(`vec3 ${oklabOut} = oklab_from_linear_srgb(${rgb})`);
		shaders_collection_controller.addDefinitions(this, function_declaration_lines);
		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
