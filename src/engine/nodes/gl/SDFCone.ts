/**
 * Function of SDF cone
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlType} from '../../poly/registers/nodes/types/Gl';

const OUTPUT_NAME = 'float';
class SDFConeGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	height = ParamConfig.FLOAT(1);
	angle = ParamConfig.FLOAT(0.25 * Math.PI, {
		range: [0, Math.PI],
		rangeLocked: [true, false],
		step: 0.00001,
	});
}
const ParamsConfig = new SDFConeGlParamsConfig();
export class SDFConeGlNode extends BaseSDFGlNode<SDFConeGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.SDF_CONE
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
		const angle = ThreeToGl.vector2(this.variableForInputParam(this.p.angle));
		const height = ThreeToGl.float(this.variableForInputParam(this.p.height));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdConeWrapped(${position} - ${center}, ${angle}, ${height})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDFMethods(shadersCollectionController);
	}
}
