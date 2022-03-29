/**
 * transforms a range 0-1 into a range that can be read by the [gl/okLabToRgb](/docs/nodes/gl/okLabToRgb)
 *
 *
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
class UvToOklabGlParamsConfig extends NodeParamsConfig {
	uvw = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new UvToOklabGlParamsConfig();
export class UvToOklabGlNode extends TypedGlNode<UvToOklabGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'uvToOklab';
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

		const uvw = ThreeToGl.vector3(this.variableForInputParam(this.p.uvw));

		const oklabOut = this.glVarName(OUTPUT_NAME);
		body_lines.push(`vec3 ${oklabOut} = uvToOklab(${uvw})`);
		shaders_collection_controller.addDefinitions(this, function_declaration_lines);
		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
