/**
 * returns the point of a CatmullRomCurve3 at the t position
 *
 * @remarks
 *
 *
 */

import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {Vector3} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedJsNode} from './_Base';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
const T_NAME = 't';
const OUTPUT_NAME = 'position';

class CatmullRomCurve3GetPointJsParamsConfig extends NodeParamsConfig {
	t = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new CatmullRomCurve3GetPointJsParamsConfig();

export class CatmullRomCurve3GetPointJsNode extends TypedJsNode<CatmullRomCurve3GetPointJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'catmullRomCurve3GetPoint';
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(
				JsConnectionPointType.CATMULL_ROM_CURVE3,
				JsConnectionPointType.CATMULL_ROM_CURVE3,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(T_NAME, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const inputCurve = this.variableForInput(shadersCollectionController, JsConnectionPointType.CATMULL_ROM_CURVE3);
		const t = this.variableForInputParam(shadersCollectionController, this.p.t);
		const varName = this.jsVarName(OUTPUT_NAME);
		shadersCollectionController.addVariable(this, varName, new Vector3());
		const func = Poly.namedFunctionsRegister.getFunction(
			'catmullRomCurve3GetPoint',
			this,
			shadersCollectionController
		);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.VECTOR3,
				varName,
				value: func.asString(inputCurve, t, varName),
			},
		]);
	}
}
