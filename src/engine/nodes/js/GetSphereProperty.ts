/**
 * get a sphere property
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {Vector3} from 'three';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum GetSpherePropertyJsNodeInputName {
	center = 'center',
	radius = 'radius',
}

export class GetSpherePropertyJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getSphereProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.SPHERE, JsConnectionPointType.SPHERE, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(GetSpherePropertyJsNodeInputName.center, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(GetSpherePropertyJsNodeInputName.radius, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const sphere = this.variableForInput(shadersCollectionController, JsConnectionPointType.SPHERE);

		const _v3 = (
			propertyName: GetSpherePropertyJsNodeInputName,
			functionName: 'getSphereCenter',
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
					value: func.asString(sphere, tmpVarName),
				},
			]);
		};
		const _f = (
			propertyName: GetSpherePropertyJsNodeInputName,
			functionName: 'getSphereRadius',
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
					value: func.asString(sphere),
				},
			]);
		};

		_v3(GetSpherePropertyJsNodeInputName.center, 'getSphereCenter', JsConnectionPointType.VECTOR3);
		_f(GetSpherePropertyJsNodeInputName.radius, 'getSphereRadius', JsConnectionPointType.FLOAT);
	}
}
