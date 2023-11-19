/**
 * get an intersection property
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {Vector2, Vector3} from 'three';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export enum GetIntersectionPropertyJsNodeOutputName {
	distance = 'distance',
	object = 'object',
	point = 'point',
	normal = 'normal',
	uv = 'uv',
	faceIndex = 'faceIndex',
	// uv2 = 'uv2',
}

export class GetIntersectionPropertyJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getIntersectionProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(
				JsConnectionPointType.INTERSECTION,
				JsConnectionPointType.INTERSECTION,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(GetIntersectionPropertyJsNodeOutputName.distance, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(GetIntersectionPropertyJsNodeOutputName.object, JsConnectionPointType.OBJECT_3D),
			new JsConnectionPoint(GetIntersectionPropertyJsNodeOutputName.point, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(GetIntersectionPropertyJsNodeOutputName.normal, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(GetIntersectionPropertyJsNodeOutputName.uv, JsConnectionPointType.VECTOR2),
			new JsConnectionPoint(GetIntersectionPropertyJsNodeOutputName.faceIndex, JsConnectionPointType.INT),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const object3D = inputObject3D(this, shadersCollectionController);
		const intersection = this.variableForInput(shadersCollectionController, JsConnectionPointType.INTERSECTION);

		const _i = (
			propertyName: GetIntersectionPropertyJsNodeOutputName,
			functionName: 'getIntersectionPropertyFaceIndex',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(intersection),
				},
			]);
		};
		const _f = (
			propertyName: GetIntersectionPropertyJsNodeOutputName,
			functionName: 'getIntersectionPropertyDistance',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(intersection),
				},
			]);
		};
		const _v2 = (
			propertyName: GetIntersectionPropertyJsNodeOutputName,
			functionName: 'getIntersectionPropertyUv',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const tmpVarName = shadersCollectionController.addVariable(this, new Vector2());
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(intersection, tmpVarName),
				},
			]);
		};
		const _v3 = (
			propertyName: GetIntersectionPropertyJsNodeOutputName,
			functionName: 'getIntersectionPropertyPoint' | 'getIntersectionPropertyNormal',
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
					value: func.asString(intersection, tmpVarName),
				},
			]);
		};
		const _object = (
			propertyName: GetIntersectionPropertyJsNodeOutputName,
			functionName: 'getIntersectionPropertyObject',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, intersection),
				},
			]);
		};

		_i(
			GetIntersectionPropertyJsNodeOutputName.faceIndex,
			'getIntersectionPropertyFaceIndex',
			JsConnectionPointType.INT
		);
		_f(
			GetIntersectionPropertyJsNodeOutputName.distance,
			'getIntersectionPropertyDistance',
			JsConnectionPointType.FLOAT
		);
		_v3(
			GetIntersectionPropertyJsNodeOutputName.point,
			'getIntersectionPropertyPoint',
			JsConnectionPointType.VECTOR3
		);
		_v3(
			GetIntersectionPropertyJsNodeOutputName.normal,
			'getIntersectionPropertyNormal',
			JsConnectionPointType.VECTOR3
		);
		_v2(GetIntersectionPropertyJsNodeOutputName.uv, 'getIntersectionPropertyUv', JsConnectionPointType.VECTOR2);
		_object(
			GetIntersectionPropertyJsNodeOutputName.object,
			'getIntersectionPropertyObject',
			JsConnectionPointType.OBJECT_3D
		);
	}
}
