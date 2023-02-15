/**
 * get children RBD properties
 *
 *
 */

import type {RigidBody} from '@dimforge/rapier3d-compat';
import {ActorNodeTriggerContext, ParamlessTypedActorNode} from './_Base';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {Vector3, Object3D} from 'three';
import {TypeAssert} from '../../poly/Assert';
import {
	CreateCopyableItemFunc,
	updateCopyableArrayLength,
	updatePrimitiveArrayLength,
} from '../../../core/ArrayCopyUtils';
import {_getRBD} from '../../../core/physics/PhysicsRBD';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

enum GetChildrenPhysicsRBDPropertiesActorNodeInputName {
	linVel = 'linVel',
	angVel = 'angVel',
	linearDamping = 'linearDamping',
	angularDamping = 'angularDamping',
	isSleeping = 'isSleeping',
	isMoving = 'isMoving',
}
// const OBJECT_PROPERTIES: GetChildrenPhysicsRBDPropertiesActorNodeInputName[] = [
// 	GetChildrenPhysicsRBDPropertiesActorNodeInputName.linVel,
// 	GetChildrenPhysicsRBDPropertiesActorNodeInputName.angVel,
// 	GetChildrenPhysicsRBDPropertiesActorNodeInputName.linearDamping,
// 	GetChildrenPhysicsRBDPropertiesActorNodeInputName.angularDamping,
// 	GetChildrenPhysicsRBDPropertiesActorNodeInputName.isSleeping,
// 	GetChildrenPhysicsRBDPropertiesActorNodeInputName.isMoving,
// ];

const tmpV3Item: Vector3 = new Vector3();
const tmpV3: Vector3[] = [];
const tmpNumber: number[] = [];
const tmpBoolean: boolean[] = [];
const createVector3: CreateCopyableItemFunc<Vector3> = () => new Vector3();
type GetVector3Property = (rigidBody: RigidBody, target: Vector3) => void;
type GetPrimitiveProperty<T extends boolean | number | string> = (rigidBody: RigidBody) => T;

function updateCopyableArray<V extends Vector3>(
	children: Object3D[],
	targetVectors: V[],
	createItem: CreateCopyableItemFunc<V>,
	getProp: GetVector3Property
) {
	updateCopyableArrayLength(targetVectors, children.length, createItem);

	for (let i = 0; i < children.length; i++) {
		const body = _getRBD(children[i]);
		if (body) {
			getProp(body, tmpV3Item);
		} else {
			tmpV3Item.set(0, 0, 0);
		}
		targetVectors[i].copy(tmpV3Item);
	}
	return targetVectors;
}

function updatePrimitiveArray<T extends boolean | number | string>(
	children: Object3D[],
	targetValues: T[],
	defaultValue: T,
	getProp: GetPrimitiveProperty<T>
) {
	updatePrimitiveArrayLength(targetValues, children.length, defaultValue);
	for (let i = 0; i < children.length; i++) {
		const body = _getRBD(children[i]);
		const val = body ? getProp(body) : defaultValue;
		targetValues[i] = val;
	}
	return targetValues;
}

export class GetChildrenPhysicsRBDPropertiesActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getChildrenPhysicsRBDProperties';
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
				GetChildrenPhysicsRBDPropertiesActorNodeInputName.linVel,
				ActorConnectionPointType.VECTOR3_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPhysicsRBDPropertiesActorNodeInputName.angVel,
				ActorConnectionPointType.VECTOR3_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPhysicsRBDPropertiesActorNodeInputName.linearDamping,
				ActorConnectionPointType.FLOAT_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPhysicsRBDPropertiesActorNodeInputName.angularDamping,
				ActorConnectionPointType.FLOAT_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPhysicsRBDPropertiesActorNodeInputName.isSleeping,
				ActorConnectionPointType.BOOLEAN_ARRAY
			),
			new ActorConnectionPoint(
				GetChildrenPhysicsRBDPropertiesActorNodeInputName.isMoving,
				ActorConnectionPointType.BOOLEAN
			),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetChildrenPhysicsRBDPropertiesActorNodeInputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const children = Object3D.children;

		const firstChild = children[0];
		if (!firstChild) {
			return [];
		}
		switch (outputName) {
			case GetChildrenPhysicsRBDPropertiesActorNodeInputName.linVel: {
				return updateCopyableArray(children, tmpV3, createVector3, (body, vec3) => {
					const linVel = body.linvel();
					return vec3.set(linVel.x, linVel.y, linVel.z);
				});
			}
			case GetChildrenPhysicsRBDPropertiesActorNodeInputName.angVel: {
				return updateCopyableArray(children, tmpV3, createVector3, (body, vec3) => {
					const angVel = body.angvel();
					return vec3.set(angVel.x, angVel.y, angVel.z);
				});
			}
			case GetChildrenPhysicsRBDPropertiesActorNodeInputName.linearDamping: {
				return updatePrimitiveArray(children, tmpNumber, 0, (body) => body.linearDamping());
			}
			case GetChildrenPhysicsRBDPropertiesActorNodeInputName.angularDamping: {
				return updatePrimitiveArray(children, tmpNumber, 0, (body) => body.angularDamping());
			}
			case GetChildrenPhysicsRBDPropertiesActorNodeInputName.isSleeping: {
				return updatePrimitiveArray(children, tmpBoolean, false, (body) => body.isSleeping());
			}
			case GetChildrenPhysicsRBDPropertiesActorNodeInputName.isMoving: {
				return updatePrimitiveArray(children, tmpBoolean, false, (body) => body.isMoving());
			}
		}
		TypeAssert.unreachable(outputName);
	}
}
