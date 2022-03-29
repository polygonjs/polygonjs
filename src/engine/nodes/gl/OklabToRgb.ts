/**
 * transforms an input color (vec3) from OKLAB color space to RGB
 *
 * @remarks
 * 
 * This is using the algorithm from Inigo Quilez's https://www.shadertoy.com/view/WtccD7, which is implenting Björn Ottosson's
 https://bottosson.github.io/posts/oklab/
 *
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';

import oklab from './gl/oklab.glsl';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'rgb';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class OklabToRgbGlParamsConfig extends NodeParamsConfig {
	oklab = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new OklabToRgbGlParamsConfig();
export class OklabToRgbGlNode extends TypedGlNode<OklabToRgbGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'oklabToRgb';
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

		function_declaration_lines.push(new FunctionGLDefinition(this, oklab));

		const value = ThreeToGl.vector3(this.variableForInputParam(this.p.oklab));

		const rgb = this.glVarName(OUTPUT_NAME);
		body_lines.push(`vec3 ${rgb} = linear_srgb_from_oklab(${value})`);
		shaders_collection_controller.addDefinitions(this, function_declaration_lines);
		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
