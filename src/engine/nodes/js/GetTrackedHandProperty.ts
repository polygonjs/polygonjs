/**
 * get properties from tracked hand landmarks
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {Vector3} from 'three';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export enum GetTrackedHandPropertyJsNodeInputName {
	thumbDirection = 'thumbDirection',
	indexDirection = 'indexDirection',
	middleDirection = 'middleDirection',
	ringDirection = 'ringDirection',
	pinkyDirection = 'pinkyDirection',
}
const DIRECTION_PROPERTIES: GetTrackedHandPropertyJsNodeInputName[] = [
	GetTrackedHandPropertyJsNodeInputName.thumbDirection,
	GetTrackedHandPropertyJsNodeInputName.indexDirection,
	GetTrackedHandPropertyJsNodeInputName.middleDirection,
	GetTrackedHandPropertyJsNodeInputName.ringDirection,
	GetTrackedHandPropertyJsNodeInputName.pinkyDirection,
];

export class GetTrackedHandPropertyJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getTrackedHandProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(
				JsConnectionPointType.VECTOR4_ARRAY,
				JsConnectionPointType.VECTOR4_ARRAY,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			...DIRECTION_PROPERTIES.map((prop) => new JsConnectionPoint(prop, JsConnectionPointType.VECTOR3)),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const values = this.variableForInput(shadersCollectionController, JsConnectionPointType.VECTOR4_ARRAY);

		const _v3 = (
			propertyName: GetTrackedHandPropertyJsNodeInputName,
			functionName:
				| 'getTrackedHandThumbDirection'
				| 'getTrackedHandIndexDirection'
				| 'getTrackedHandMiddleDirection'
				| 'getTrackedHandRingDirection'
				| 'getTrackedHandPinkyDirection',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const tmpVarName = shadersCollectionController.addVariable(this, new Vector3());
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(values, tmpVarName),
				},
			]);
		};

		_v3(
			GetTrackedHandPropertyJsNodeInputName.thumbDirection,
			'getTrackedHandThumbDirection',
			JsConnectionPointType.VECTOR3
		);
		_v3(
			GetTrackedHandPropertyJsNodeInputName.indexDirection,
			'getTrackedHandIndexDirection',
			JsConnectionPointType.VECTOR3
		);
		_v3(
			GetTrackedHandPropertyJsNodeInputName.middleDirection,
			'getTrackedHandIndexDirection',
			JsConnectionPointType.VECTOR3
		);
		_v3(
			GetTrackedHandPropertyJsNodeInputName.ringDirection,
			'getTrackedHandRingDirection',
			JsConnectionPointType.VECTOR3
		);
		_v3(
			GetTrackedHandPropertyJsNodeInputName.pinkyDirection,
			'getTrackedHandPinkyDirection',
			JsConnectionPointType.VECTOR3
		);
	}
}
