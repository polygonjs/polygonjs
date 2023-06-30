/**
 * Function of SDF Torus
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
class SDFTorusJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius1 = ParamConfig.FLOAT(1);
	radius2 = ParamConfig.FLOAT(0.5);
}
const ParamsConfig = new SDFTorusJsParamsConfig();
export class SDFTorusJsNode extends BaseSDFJsNode<SDFTorusJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SDF_TORUS;
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
		const radius1 = this.variableForInputParam(shadersCollectionController, this.p.radius1);
		const radius2 = this.variableForInputParam(shadersCollectionController, this.p.radius2);

		const out = this.jsVarName(OUTPUT_NAME);
		const func = Poly.namedFunctionsRegister.getFunction('SDFTorus', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.FLOAT,
				varName: out,
				value: func.asString(position, center, radius1, radius2),
			},
		]);
	}
}
