/**
 * Function of SDF Circle
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
import {GlType} from '../../poly/registers/nodes/types/Gl';

const OUTPUT_NAME = 'float';
class SDF2DCircleGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR2([0, 0], {hidden: true});
	center = ParamConfig.VECTOR2([0, 0]);
	radius = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SDF2DCircleGlParamsConfig();
export class SDF2DCircleGlNode extends BaseSDF2DGlNode<SDF2DCircleGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.SDF_2D_CIRCLE;
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
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdCircle(${position} - ${center}, ${radius})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDF2DMethods(shadersCollectionController);
	}
}
