/**
 * get a ray property
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {Vector3} from 'three';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum GetRayPropertyJsNodeInputName {
	origin = 'origin',
	direction = 'direction',
}

export class GetRayPropertyJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getRayProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.RAY, JsConnectionPointType.RAY, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(GetRayPropertyJsNodeInputName.origin, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(GetRayPropertyJsNodeInputName.direction, JsConnectionPointType.VECTOR3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const ray = this.variableForInput(shadersCollectionController, JsConnectionPointType.RAY);

		const _v3 = (
			propertyName: GetRayPropertyJsNodeInputName,
			functionName: 'getRayOrigin' | 'getRayDirection',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new Vector3());
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(ray, varName),
				},
			]);
		};

		_v3(GetRayPropertyJsNodeInputName.origin, 'getRayOrigin', JsConnectionPointType.VECTOR3);
		_v3(GetRayPropertyJsNodeInputName.direction, 'getRayDirection', JsConnectionPointType.VECTOR3);
	}
}
