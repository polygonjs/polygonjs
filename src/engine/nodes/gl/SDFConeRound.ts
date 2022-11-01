/**
 * Function of SDF cone round
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

const OUTPUT_NAME = 'float';
class SDFConeRoundGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	height = ParamConfig.FLOAT(1);
	radius1 = ParamConfig.FLOAT(0.5);
	radius2 = ParamConfig.FLOAT(0.2);
}
const ParamsConfig = new SDFConeRoundGlParamsConfig();
export class SDFConeRoundGlNode extends BaseSDFGlNode<SDFConeRoundGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFConeRound';
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
		const height = ThreeToGl.float(this.variableForInputParam(this.p.height));
		const radius1 = ThreeToGl.float(this.variableForInputParam(this.p.radius1));
		const radius2 = ThreeToGl.float(this.variableForInputParam(this.p.radius2));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdRoundCone(${position} - ${center}, ${radius1}, ${radius2}, ${height})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDFMethods(shadersCollectionController);
	}
}
