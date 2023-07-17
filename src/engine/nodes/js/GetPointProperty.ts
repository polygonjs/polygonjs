/**
 * get a point property
 *
 *
 */

import {Vector3} from 'three';
import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {
	GetPointPropertyJsNodeInputName,
	// POINT_VECTOR3_PROPERTIES,
} from '../../../core/reactivity/PointPropertyReactivity';
import {Poly} from '../../Poly';
import {inputObject3D, inputPointIndex} from './_BaseObject3D';
import {JsType} from '../../poly/registers/nodes/types/Js';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
export class GetPointPropertyJsNode extends ParamlessTypedJsNode {
	static override type() {
		return JsType.GET_POINT_PROPERTY;
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(GetPointPropertyJsNodeInputName.ptnum, JsConnectionPointType.INT, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(GetPointPropertyJsNodeInputName.ptnum, JsConnectionPointType.INT, CONNECTION_OPTIONS),
			new JsConnectionPoint(GetPointPropertyJsNodeInputName.position, JsConnectionPointType.VECTOR3),
		]);
	}
	override setLines(linesController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const object3D = inputObject3D(this, linesController);
		const ptnum = inputPointIndex(this, linesController);

		const _v3 = (propertyName: string, functionName: 'getPointPosition') => {
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

		_int(GetPointPropertyJsNodeInputName.ptnum, 'getPointIndex');
		_v3(GetPointPropertyJsNodeInputName.position, 'getPointPosition');
		// POINT_VECTOR3_PROPERTIES.forEach((propertyName) => {
		// 	_v3(propertyName, JsConnectionPointType.VECTOR3);
		// });
		// OBJECT_BOOLEAN_PROPERTIES.forEach((propertyName) => {
		// 	_f(propertyName, JsConnectionPointType.BOOLEAN);
		// });
		// _f('rotation', JsConnectionPointType.EULER);
		// _f('quaternion', JsConnectionPointType.QUATERNION);
		// _f('matrix', JsConnectionPointType.MATRIX4);
		// _f('material', JsConnectionPointType.MATERIAL);
	}
}
