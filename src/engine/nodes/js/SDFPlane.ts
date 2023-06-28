/**
 * Function of SDF Plane
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
class SDFPlaneJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	normal = ParamConfig.VECTOR3([0, 1, 0]);
	offset = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new SDFPlaneJsParamsConfig();
export class SDFPlaneJsNode extends BaseSDFJsNode<SDFPlaneJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SDF_PLANE;
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
		const normal = this.variableForInputParam(shadersCollectionController, this.p.normal);
		const offset = this.variableForInputParam(shadersCollectionController, this.p.offset);

		const out = this.jsVarName(OUTPUT_NAME);
		const func = Poly.namedFunctionsRegister.getFunction('SDFPlane', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.FLOAT,
				varName: out,
				value: func.asString(position, center, normal, offset),
			},
		]);
	}
}
