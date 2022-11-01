/**
 * Function of SDF Stairs
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
class SDF2DStairsGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR2([0, 0], {hidden: true});
	center = ParamConfig.VECTOR2([0, 0]);
	width = ParamConfig.FLOAT(1);
	height = ParamConfig.FLOAT(1);
	steps = ParamConfig.FLOAT(5, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new SDF2DStairsGlParamsConfig();
export class SDF2DStairsGlNode extends BaseSDF2DGlNode<SDF2DStairsGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDF2DStairs';
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
		const width = ThreeToGl.float(this.variableForInputParam(this.p.width));
		const height = ThreeToGl.float(this.variableForInputParam(this.p.height));
		const steps = ThreeToGl.float(this.variableForInputParam(this.p.steps));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdStairs(${position} - ${center}, vec2(${width}, ${height}), ${steps})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDF2DMethods(shadersCollectionController);
	}
}
