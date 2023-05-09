/**
 * get a box3 property
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {Vector3} from 'three';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum GetBox3PropertyJsNodeInputName {
	min = 'min',
	max = 'max',
}

export class GetBox3PropertyJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getBox3Property';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.BOX3, JsConnectionPointType.BOX3, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(GetBox3PropertyJsNodeInputName.min, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(GetBox3PropertyJsNodeInputName.max, JsConnectionPointType.VECTOR3),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const box3 = this.variableForInput(shadersCollectionController, JsConnectionPointType.BOX3);

		const _f = (
			propertyName: GetBox3PropertyJsNodeInputName,
			functionName: 'getBox3Min' | 'getBox3Max',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const out = this.jsVarName(propertyName);
			const tmpVarName = shadersCollectionController.addVariable(this, new Vector3());
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName: out,
					value: func.asString(box3, tmpVarName),
				},
			]);
		};

		_f(GetBox3PropertyJsNodeInputName.min, 'getBox3Min', JsConnectionPointType.VECTOR3);
		_f(GetBox3PropertyJsNodeInputName.max, 'getBox3Max', JsConnectionPointType.VECTOR3);
	}
}
