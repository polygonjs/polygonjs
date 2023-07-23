/**
 * get an instance property
 *
 *
 */

import {Vector3, Quaternion} from 'three';
import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {GetInstancePropertyJsNodeInputName} from '../../../core/reactivity/InstancePropertyReactivity';
import {Poly} from '../../Poly';
import {inputObject3D, inputPointIndex} from './_BaseObject3D';
import {JsType} from '../../poly/registers/nodes/types/Js';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
export class GetInstancePropertyJsNode extends ParamlessTypedJsNode {
	static override type() {
		return JsType.GET_INSTANCE_PROPERTY;
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				GetInstancePropertyJsNodeInputName.ptnum,
				JsConnectionPointType.INT,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(
				GetInstancePropertyJsNodeInputName.ptnum,
				JsConnectionPointType.INT,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(GetInstancePropertyJsNodeInputName.instancePosition, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(
				GetInstancePropertyJsNodeInputName.instanceQuaternion,
				JsConnectionPointType.QUATERNION
			),
			new JsConnectionPoint(GetInstancePropertyJsNodeInputName.instanceScale, JsConnectionPointType.VECTOR3),
		]);
	}
	override setLines(linesController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const object3D = inputObject3D(this, linesController);
		const ptnum = inputPointIndex(this, linesController);

		const _v3 = (propertyName: string, functionName: 'getPointInstancePosition' | 'getPointInstanceScale') => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, linesController);
			const tmpVarName = linesController.addVariable(this, new Vector3());
			linesController.addBodyOrComputed(this, [
				{
					dataType: JsConnectionPointType.VECTOR3,
					varName: this.jsVarName(propertyName),
					value: func.asString(object3D, ptnum, tmpVarName),
				},
			]);
		};
		const _q = (propertyName: string, functionName: 'getPointInstanceQuaternion') => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, linesController);
			const tmpVarName = linesController.addVariable(this, new Quaternion());
			linesController.addBodyOrComputed(this, [
				{
					dataType: JsConnectionPointType.VECTOR3,
					varName: this.jsVarName(propertyName),
					value: func.asString(object3D, ptnum, tmpVarName),
				},
			]);
		};
		const _int = (propertyName: string, functionName: 'getPointIndex') => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, linesController);
			linesController.addBodyOrComputed(this, [
				{
					dataType: JsConnectionPointType.INT,
					varName: this.jsVarName(propertyName),
					value: func.asString(object3D),
				},
			]);
		};

		_int(GetInstancePropertyJsNodeInputName.ptnum, 'getPointIndex');
		_v3(GetInstancePropertyJsNodeInputName.instancePosition, 'getPointInstancePosition');
		_q(GetInstancePropertyJsNodeInputName.instanceQuaternion, 'getPointInstanceQuaternion');
		_v3(GetInstancePropertyJsNodeInputName.instanceScale, 'getPointInstanceScale');
	}
}
