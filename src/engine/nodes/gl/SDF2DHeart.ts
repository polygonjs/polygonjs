/**
 * Function of SDF Heart
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions2d/](https://iquilezles.org/articles/distfunctions2d/)
 */

import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseSDF2DGlNode} from './_BaseSDF2D';

const OUTPUT_NAME = 'float';
class SDF2DHeartGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR2([0, 0], {hidden: true});
	center = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new SDF2DHeartGlParamsConfig();
export class SDF2DHeartGlNode extends BaseSDF2DGlNode<SDF2DHeartGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDF2DHeart';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdHeart(${position} - ${center})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDF2DMethods(shadersCollectionController);
	}
}
