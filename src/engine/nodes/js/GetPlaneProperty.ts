/**
 * get a plane property
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {Vector3} from 'three';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum GetPlanePropertyJsNodeInputName {
	normal = 'normal',
	constant = 'constant',
}

export class GetPlanePropertyJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getPlaneProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.PLANE, JsConnectionPointType.PLANE, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(GetPlanePropertyJsNodeInputName.normal, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(GetPlanePropertyJsNodeInputName.constant, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const plane = this.variableForInput(shadersCollectionController, JsConnectionPointType.PLANE);

		const _v3 = (
			propertyName: GetPlanePropertyJsNodeInputName,
			functionName: 'getPlaneNormal',
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
					value: func.asString(plane, varName),
				},
			]);
		};
		const _f = (
			propertyName: GetPlanePropertyJsNodeInputName,
			functionName: 'getPlaneConstant',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName: this.jsVarName(propertyName),
					value: func.asString(plane),
				},
			]);
		};

		_v3(GetPlanePropertyJsNodeInputName.normal, 'getPlaneNormal', JsConnectionPointType.VECTOR3);
		_f(GetPlanePropertyJsNodeInputName.constant, 'getPlaneConstant', JsConnectionPointType.FLOAT);
	}
}
