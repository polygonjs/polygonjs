/**
 * get an object property
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {
	GetObjectPropertyJsNodeInputName,
	OBJECT_VECTOR3_PROPERTIES,
	OBJECT_BOOLEAN_PROPERTIES,
} from '../../../core/reactivity/ObjectPropertyReactivity';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
export class GetObjectPropertyJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getObjectProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(GetObjectPropertyJsNodeInputName.position, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(GetObjectPropertyJsNodeInputName.quaternion, JsConnectionPointType.QUATERNION),
			new JsConnectionPoint(GetObjectPropertyJsNodeInputName.scale, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(GetObjectPropertyJsNodeInputName.matrix, JsConnectionPointType.MATRIX4),
			new JsConnectionPoint(GetObjectPropertyJsNodeInputName.up, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(GetObjectPropertyJsNodeInputName.visible, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(GetObjectPropertyJsNodeInputName.matrixAutoUpdate, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(GetObjectPropertyJsNodeInputName.castShadow, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(GetObjectPropertyJsNodeInputName.receiveShadow, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(GetObjectPropertyJsNodeInputName.frustumCulled, JsConnectionPointType.BOOLEAN),
			// new ActorConnectionPoint(GetObjectPropertyActorNodeInputName.id, ActorConnectionPointType.INTEGER),
			// new ActorConnectionPoint(GetObjectPropertyActorNodeInputName.uuid, ActorConnectionPointType.BOOLEAN),
			new JsConnectionPoint(GetObjectPropertyJsNodeInputName.material, JsConnectionPointType.MATERIAL),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const object3D = inputObject3D(this, shadersCollectionController);

		const _f = (propertyName: string, type: JsConnectionPointType) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const func = Poly.namedFunctionsRegister.getFunction(
				'getObjectProperty',
				this,
				shadersCollectionController
			);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName: this.jsVarName(propertyName),
					value: func.asString(object3D, `'${propertyName}'`),
				},
			]);
		};

		OBJECT_VECTOR3_PROPERTIES.forEach((propertyName) => {
			_f(propertyName, JsConnectionPointType.VECTOR3);
		});
		OBJECT_BOOLEAN_PROPERTIES.forEach((propertyName) => {
			_f(propertyName, JsConnectionPointType.BOOLEAN);
		});
		_f('quaternion', JsConnectionPointType.QUATERNION);
		_f('matrix', JsConnectionPointType.MATRIX4);
		_f('material', JsConnectionPointType.MATERIAL);
	}
}
