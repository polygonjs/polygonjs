/**
 * outputs the luminance of a color
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const OUTPUT_NAME = 'lum';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class LuminanceGlParamsConfig extends NodeParamsConfig {
	color = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new LuminanceGlParamsConfig();
export class LuminanceGlNode extends TypedGlNode<LuminanceGlParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'luminance';
	}

	initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	setLines(shaders_collection_controller: ShadersCollectionController) {
		const value = ThreeToGl.vector3(this.variableForInputParam(this.p.color));

		const lum = this.glVarName('lum');
		// linearToRelativeLuminance is declared in threejs common.glsl.js
		const body_line = `float ${lum} = linearToRelativeLuminance(${value})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}
