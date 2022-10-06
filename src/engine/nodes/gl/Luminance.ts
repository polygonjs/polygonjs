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
import FitMethods from './gl/fit.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'lum';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class LuminanceGlParamsConfig extends NodeParamsConfig {
	color = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new LuminanceGlParamsConfig();
export class LuminanceGlNode extends TypedGlNode<LuminanceGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'luminance';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const value = ThreeToGl.vector3(this.variableForInputParam(this.p.color));

		const lum = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${lum} = luminance(${value})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, FitMethods)]);
	}
}
