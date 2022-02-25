/**
 * dithering
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedGlNode} from './_Base';
import DitherMethods from './gl/dither.glsl';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'dither';
class DitherGlParamsConfig extends NodeParamsConfig {
	alpha = ParamConfig.FLOAT(1);
	alphaTest = ParamConfig.FLOAT(0.5);
}
const ParamsConfig = new DitherGlParamsConfig();
export class DitherGlNode extends TypedGlNode<DitherGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'dither';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const alpha = ThreeToGl.float(this.variableForInputParam(this.p.alpha));
		const alphaTest = ThreeToGl.float(this.variableForInputParam(this.p.alphaTest));

		const output = this.glVarName(OUTPUT_NAME);
		const body_line = `float ${output} = dither(${alpha}, ${alphaTest})`;
		shadersCollectionController.addBodyLines(this, [body_line]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, DitherMethods)]);
	}
}
