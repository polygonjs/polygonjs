/**
 * get an object property
 *
 *
 */

import {ActorNodeTriggerContext, ParamlessTypedActorNode} from './_Base';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {Material, Mesh, Vector2, Vector3, Vector4, Quaternion} from 'three';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

enum GetObjectPropertyActorNodeInputName {
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
	uuid = 'uuid',
	name = 'name',
	// quaternion = 'quaternion',
	// rotation = 'rotation',
	up = 'up',
	matrixAutoUpdate = 'matrixAutoUpdate',
}
const OBJECT_PROPERTIES: GetObjectPropertyActorNodeInputName[] = [
	GetObjectPropertyActorNodeInputName.position,
	GetObjectPropertyActorNodeInputName.quaternion,
	GetObjectPropertyActorNodeInputName.scale,
	GetObjectPropertyActorNodeInputName.matrix,
	GetObjectPropertyActorNodeInputName.visible,
	GetObjectPropertyActorNodeInputName.castShadow,
	GetObjectPropertyActorNodeInputName.receiveShadow,
	GetObjectPropertyActorNodeInputName.frustumCulled,
	GetObjectPropertyActorNodeInputName.uuid,
	GetObjectPropertyActorNodeInputName.name,
	GetObjectPropertyActorNodeInputName.up,
	GetObjectPropertyActorNodeInputName.matrixAutoUpdate,
];
const MATERIAL_OUTPUT = 'material';

const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();
export class GetObjectPropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getObjectProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(GetObjectPropertyActorNodeInputName.position, ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint(
				GetObjectPropertyActorNodeInputName.quaternion,
				ActorConnectionPointType.QUATERNION
			),
			new ActorConnectionPoint(GetObjectPropertyActorNodeInputName.scale, ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint(GetObjectPropertyActorNodeInputName.matrix, ActorConnectionPointType.MATRIX4),
			new ActorConnectionPoint(GetObjectPropertyActorNodeInputName.up, ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint(GetObjectPropertyActorNodeInputName.visible, ActorConnectionPointType.BOOLEAN),
			new ActorConnectionPoint(
				GetObjectPropertyActorNodeInputName.matrixAutoUpdate,
				ActorConnectionPointType.BOOLEAN
			),
			new ActorConnectionPoint(GetObjectPropertyActorNodeInputName.castShadow, ActorConnectionPointType.BOOLEAN),
			new ActorConnectionPoint(
				GetObjectPropertyActorNodeInputName.receiveShadow,
				ActorConnectionPointType.BOOLEAN
			),
			new ActorConnectionPoint(
				GetObjectPropertyActorNodeInputName.frustumCulled,
				ActorConnectionPointType.BOOLEAN
			),
			// new ActorConnectionPoint(GetObjectPropertyActorNodeInputName.id, ActorConnectionPointType.INTEGER),
			// new ActorConnectionPoint(GetObjectPropertyActorNodeInputName.uuid, ActorConnectionPointType.BOOLEAN),
			new ActorConnectionPoint(MATERIAL_OUTPUT, ActorConnectionPointType.MATERIAL),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetObjectPropertyActorNodeInputName | string
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		if (OBJECT_PROPERTIES.includes(outputName as GetObjectPropertyActorNodeInputName)) {
			const propValue = Object3D[outputName as GetObjectPropertyActorNodeInputName];
			if (propValue instanceof Vector2) {
				return tmpV2.copy(propValue);
			}
			if (propValue instanceof Vector3) {
				return tmpV3.copy(propValue);
			}
			if (propValue instanceof Quaternion) {
				tmpV4.x = propValue.x;
				tmpV4.y = propValue.y;
				tmpV4.z = propValue.z;
				tmpV4.w = propValue.w;
				return tmpV4;
			}
			return propValue;
		} else {
			if (outputName == MATERIAL_OUTPUT) {
				return (Object3D as Mesh).material as Material;
			}
		}
	}
}
