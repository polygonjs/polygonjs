/**
 * Function of SDF Box
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
class SDF2DBoxGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR2([0, 0], {hidden: true});
	center = ParamConfig.VECTOR2([0, 0]);
	size = ParamConfig.VECTOR2([1, 1]);
}
const ParamsConfig = new SDF2DBoxGlParamsConfig();
export class SDF2DBoxGlNode extends BaseSDF2DGlNode<SDF2DBoxGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.SDF_2D_BOX;
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
		const size = ThreeToGl.vector2(this.variableForInputParam(this.p.size));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdBox(${position} - ${center}, ${size})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDF2DMethods(shadersCollectionController);
	}
}
