/**
 * get an object property
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {EvaluatorConstant} from './code/assemblers/actor/Evaluator';
// import {Vector2, Vector3, Vector4} from 'three';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum GetObjectPropertyJsNodeInputName {
	position = 'position',
	quaternion = 'quaternion',
	scale = 'scale',
	matrix = 'matrix',
	visible = 'visible',
	castShadow = 'castShadow',
	receiveShadow = 'receiveShadow',
	frustumCulled = 'frustumCulled',
	// ptnum = 'ptnum',
	// id = 'id',
	// uuid = 'uuid',
	// name = 'name',
	// quaternion = 'quaternion',
	// rotation = 'rotation',
	up = 'up',
	matrixAutoUpdate = 'matrixAutoUpdate',
	material = 'material',
}
const VECTOR3_PROPERTIES = [
	GetObjectPropertyJsNodeInputName.position,
	GetObjectPropertyJsNodeInputName.scale,
	GetObjectPropertyJsNodeInputName.up,
];
const BOOLEAN_PROPERTIES = [
	GetObjectPropertyJsNodeInputName.visible,
	GetObjectPropertyJsNodeInputName.castShadow,
	GetObjectPropertyJsNodeInputName.receiveShadow,
	GetObjectPropertyJsNodeInputName.frustumCulled,
	GetObjectPropertyJsNodeInputName.matrixAutoUpdate,
];
// const OBJECT_PROPERTIES: GetObjectPropertyJsNodeInputName[] = [
// 	GetObjectPropertyJsNodeInputName.position,
// 	GetObjectPropertyJsNodeInputName.quaternion,
// 	GetObjectPropertyJsNodeInputName.scale,
// 	GetObjectPropertyJsNodeInputName.matrix,
// 	GetObjectPropertyJsNodeInputName.visible,
// 	GetObjectPropertyJsNodeInputName.castShadow,
// 	GetObjectPropertyJsNodeInputName.receiveShadow,
// 	GetObjectPropertyJsNodeInputName.frustumCulled,
// 	GetObjectPropertyJsNodeInputName.uuid,
// 	GetObjectPropertyJsNodeInputName.name,
// 	GetObjectPropertyJsNodeInputName.up,
// 	GetObjectPropertyJsNodeInputName.matrixAutoUpdate,
// ];
// const MATERIAL_OUTPUT = 'material';

// const tmpV2 = new Vector2();
// const tmpV3 = new Vector3();
// const tmpV4 = new Vector4();
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
		VECTOR3_PROPERTIES.forEach((property) => {
			shadersCollectionController.addBodyOrComputed(
				this,
				JsConnectionPointType.VECTOR3,
				this.jsVarName(property),
				`${EvaluatorConstant.OBJECT_3D}.${property}`
			);
		});
		BOOLEAN_PROPERTIES.forEach((property) => {
			shadersCollectionController.addBodyOrComputed(
				this,
				JsConnectionPointType.BOOLEAN,
				this.jsVarName(property),
				`${EvaluatorConstant.OBJECT_3D}.${property}`
			);
		});
		shadersCollectionController.addBodyOrComputed(
			this,
			JsConnectionPointType.QUATERNION,
			this.jsVarName(GetObjectPropertyJsNodeInputName.quaternion),
			`${EvaluatorConstant.OBJECT_3D}.quaternion`
		);

		shadersCollectionController.addBodyOrComputed(
			this,
			JsConnectionPointType.MATRIX4,
			this.jsVarName(GetObjectPropertyJsNodeInputName.matrix),
			`${EvaluatorConstant.OBJECT_3D}.matrix`
		);
		shadersCollectionController.addBodyOrComputed(
			this,
			JsConnectionPointType.MATERIAL,
			this.jsVarName(GetObjectPropertyJsNodeInputName.material),
			`${EvaluatorConstant.OBJECT_3D}.material`
		);
	}

	// public override outputValue(
	// 	context: ActorNodeTriggerContext,
	// 	outputName: GetObjectPropertyActorNodeInputName | string
	// ): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
	// 	const Object3D =
	// 		this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
	// 		context.Object3D;
	// 	if (OBJECT_PROPERTIES.includes(outputName as GetObjectPropertyActorNodeInputName)) {
	// 		const propValue = Object3D[outputName as GetObjectPropertyActorNodeInputName];
	// 		if (propValue instanceof Vector2) {
	// 			return tmpV2.copy(propValue);
	// 		}
	// 		if (propValue instanceof Vector3) {
	// 			return tmpV3.copy(propValue);
	// 		}
	// 		if (propValue instanceof Quaternion) {
	// 			tmpV4.x = propValue.x;
	// 			tmpV4.y = propValue.y;
	// 			tmpV4.z = propValue.z;
	// 			tmpV4.w = propValue.w;
	// 			return tmpV4;
	// 		}
	// 		return propValue;
	// 	} else {
	// 		if (outputName == MATERIAL_OUTPUT) {
	// 			return (Object3D as Mesh).material as Material;
	// 		}
	// 	}
	// }
}
