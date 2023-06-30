/**
 * Function of SDF Tube
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType, JsConnectionPoint} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {BaseSDFJsNode} from './_BaseSDF';
import {Poly} from '../../Poly';
import {JsType} from '../../poly/registers/nodes/types/Js';
const OUTPUT_NAME = 'float';
class SDFTubeJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius = ParamConfig.FLOAT(0.5);
}
const ParamsConfig = new SDFTubeJsParamsConfig();
export class SDFTubeJsNode extends BaseSDFJsNode<SDFTubeJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SDF_TUBE;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const position = this.position(shadersCollectionController);
		const center = this.variableForInputParam(shadersCollectionController, this.p.center);
		const radius = this.variableForInputParam(shadersCollectionController, this.p.radius);

		const out = this.jsVarName(OUTPUT_NAME);
		const func = Poly.namedFunctionsRegister.getFunction('SDFTube', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.FLOAT,
				varName: out,
				value: func.asString(position, center, radius),
			},
		]);
	}
}
