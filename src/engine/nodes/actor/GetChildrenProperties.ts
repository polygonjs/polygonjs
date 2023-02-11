/**
 * get an object properties
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
import {
	Vector2,
	Vector3,
	// Vector4,
	Quaternion,
	Object3D,
} from 'three';
import {CoreType} from '../../../core/Type';
import {
	Copyable,
	CreateCopyableItemFunc,
	updateCopyableArrayLength,
	updatePrimitiveArrayLength,
} from '../../../core/ArrayCopyUtils';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

enum GetChildrenPropertiesActorNodeInputName {
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
const OBJECT_PROPERTIES: GetChildrenPropertiesActorNodeInputName[] = [
	GetChildrenPropertiesActorNodeInputName.position,
	GetChildrenPropertiesActorNodeInputName.quaternion,
	GetChildrenPropertiesActorNodeInputName.scale,
	GetChildrenPropertiesActorNodeInputName.matrix,
	GetChildrenPropertiesActorNodeInputName.visible,
	GetChildrenPropertiesActorNodeInputName.castShadow,
	GetChildrenPropertiesActorNodeInputName.receiveShadow,
	GetChildrenPropertiesActorNodeInputName.frustumCulled,
	GetChildrenPropertiesActorNodeInputName.uuid,
	GetChildrenPropertiesActorNodeInputName.name,
	GetChildrenPropertiesActorNodeInputName.up,
	GetChildrenPropertiesActorNodeInputName.matrixAutoUpdate,
];
//  const MATERIAL_OUTPUT = 'material';

const tmpV2: Vector2[] = [];
const tmpV3: Vector3[] = [];
// const tmpV4: Vector4[] = [];
const tmpQuat: Quaternion[] = [];
const tmpBoolean: boolean[] = [];
const createVector2: CreateCopyableItemFunc<Vector2> = () => new Vector2();
const createVector3: CreateCopyableItemFunc<Vector3> = () => new Vector3();
const createQuaternion: CreateCopyableItemFunc<Quaternion> = () => new Quaternion();

function updateCopyableArray<V extends Copyable>(
	children: Object3D[],
	propertyName: GetChildrenPropertiesActorNodeInputName,
	targetVectors: V[],
	createItem: CreateCopyableItemFunc<V>
) {
	updateCopyableArrayLength(targetVectors, children.length, createItem);

	for (let i = 0; i < children.length; i++) {
		const val = children[i][propertyName as GetChildrenPropertiesActorNodeInputName] as V;
		targetVectors[i].copy(val as any);
	}
	return targetVectors;
}

function updatePrimitiveArray<T extends boolean | number | string>(
	children: Object3D[],
	propertyName: GetChildrenPropertiesActorNodeInputName,
	targetValues: T[],
	defaultValue: T
) {
	updatePrimitiveArrayLength(targetValues, children.length, defaultValue);
	for (let i = 0; i < children.length; i++) {
		const val = children[i][propertyName as GetChildrenPropertiesActorNodeInputName] as T;
		targetValues[i] = val;
	}
	return targetValues;
}

export class GetChildrenPropertiesActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getChildrenProperties';
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
			new ActorConnectionPoint(
				GetChildrenPropertiesActorNodeInputName.position,
				ActorConnectionPointType.VECTOR3_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPropertiesActorNodeInputName.quaternion,
				ActorConnectionPointType.QUATERNION_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPropertiesActorNodeInputName.scale,
				ActorConnectionPointType.VECTOR3_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPropertiesActorNodeInputName.matrix,
				ActorConnectionPointType.MATRIX4_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPropertiesActorNodeInputName.up,
				ActorConnectionPointType.VECTOR3_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPropertiesActorNodeInputName.visible,
				ActorConnectionPointType.BOOLEAN_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPropertiesActorNodeInputName.matrixAutoUpdate,
				ActorConnectionPointType.BOOLEAN_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPropertiesActorNodeInputName.castShadow,
				ActorConnectionPointType.BOOLEAN_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPropertiesActorNodeInputName.receiveShadow,
				ActorConnectionPointType.BOOLEAN_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPropertiesActorNodeInputName.frustumCulled,
				ActorConnectionPointType.BOOLEAN_ARRAY
			),
			// new ActorConnectionPoint(GetChildrenPropertiesActorNodeInputName.id, ActorConnectionPointType.INTEGER),
			// new ActorConnectionPoint(GetChildrenPropertiesActorNodeInputName.uuid, ActorConnectionPointType.BOOLEAN),
			//  new ActorConnectionPoint(MATERIAL_OUTPUT, ActorConnectionPointType.MATERIAL),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetChildrenPropertiesActorNodeInputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const children = Object3D.children;
		const firstChild = children[0];
		if (!firstChild) {
			return [];
		}
		if (OBJECT_PROPERTIES.includes(outputName)) {
			const firstPropValue = firstChild[outputName];
			if (firstPropValue instanceof Vector2) {
				return updateCopyableArray(children, outputName, tmpV2, createVector2);
			}
			if (firstPropValue instanceof Vector3) {
				return updateCopyableArray(children, outputName, tmpV3, createVector3);
			}
			if (firstPropValue instanceof Quaternion) {
				return updateCopyableArray(children, outputName, tmpQuat, createQuaternion);
			}
			if (CoreType.isBoolean(firstPropValue)) {
				return updatePrimitiveArray(children, outputName, tmpBoolean, firstPropValue);
			}
			// return firstPropValue;
		}
	}
}
