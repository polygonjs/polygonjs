/**
 * returns true if a box contains a point
 *
 * @remarks
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export enum Box3ContainsPointOutputName {
	CONTAINS = 'contains',
}

class Box3ContainsPointJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new Box3ContainsPointJsParamsConfig();
export class Box3ContainsPointJsNode extends TypedJsNode<Box3ContainsPointJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'box3ContainsPoint';
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.BOX3, JsConnectionPointType.BOX3, CONNECTION_OPTIONS),
			// new JsConnectionPoint(JsConnectionPointType.VECTOR3, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(
				Box3ContainsPointOutputName.CONTAINS,
				JsConnectionPointType.BOOLEAN,
				CONNECTION_OPTIONS
			),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const box3 = this.variableForInput(linesController, JsConnectionPointType.BOX3);
		const position = this.variableForInputParam(linesController, this.p.position);
		const out = this.jsVarName(Box3ContainsPointOutputName.CONTAINS);

		const func = Poly.namedFunctionsRegister.getFunction('box3ContainsPoint', this, linesController);
		const bodyLine = func.asString(box3, position);
		linesController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.PLANE, varName: out, value: bodyLine},
		]);
	}
}
