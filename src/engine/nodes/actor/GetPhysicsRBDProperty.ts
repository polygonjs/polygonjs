/**
 * get an RBD  property
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
import {_getRBD} from '../../../core/physics/PhysicsRBD';
import {TypeAssert} from '../../poly/Assert';
import {Vector3} from 'three';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export enum GetPhysicsRBDPropertyActorNodeInputName {
	linVel = 'linVel',
	angVel = 'angVel',
	linearDamping = 'linearDamping',
	angularDamping = 'angularDamping',
	isSleeping = 'isSleeping',
	isMoving = 'isMoving',
}
const tmpV3 = new Vector3();
const PROPERTIES: GetPhysicsRBDPropertyActorNodeInputName[] = [
	GetPhysicsRBDPropertyActorNodeInputName.linVel,
	GetPhysicsRBDPropertyActorNodeInputName.angVel,
	GetPhysicsRBDPropertyActorNodeInputName.linearDamping,
	GetPhysicsRBDPropertyActorNodeInputName.angularDamping,
	GetPhysicsRBDPropertyActorNodeInputName.isSleeping,
	GetPhysicsRBDPropertyActorNodeInputName.isMoving,
];

export class GetPhysicsRBDPropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getPhysicsRBDproperty';
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
			new ActorConnectionPoint(GetPhysicsRBDPropertyActorNodeInputName.linVel, ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint(GetPhysicsRBDPropertyActorNodeInputName.angVel, ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint(
				GetPhysicsRBDPropertyActorNodeInputName.linearDamping,
				ActorConnectionPointType.FLOAT
			),
			new ActorConnectionPoint(
				GetPhysicsRBDPropertyActorNodeInputName.angularDamping,
				ActorConnectionPointType.FLOAT
			),
			new ActorConnectionPoint(
				GetPhysicsRBDPropertyActorNodeInputName.isSleeping,
				ActorConnectionPointType.BOOLEAN
			),
			new ActorConnectionPoint(
				GetPhysicsRBDPropertyActorNodeInputName.isSleeping,
				ActorConnectionPointType.BOOLEAN
			),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetPhysicsRBDPropertyActorNodeInputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		if (PROPERTIES.includes(outputName as GetPhysicsRBDPropertyActorNodeInputName)) {
			const body = _getRBD(Object3D);
			switch (outputName) {
				case GetPhysicsRBDPropertyActorNodeInputName.linVel: {
					if (body) {
						const linVel = body.linvel();
						return tmpV3.set(linVel.x, linVel.y, linVel.z);
					} else {
						return tmpV3.set(0, 0, 0);
					}
				}
				case GetPhysicsRBDPropertyActorNodeInputName.angVel: {
					if (body) {
						const angVel = body.angvel();
						return tmpV3.set(angVel.x, angVel.y, angVel.z);
					} else {
						return tmpV3.set(0, 0, 0);
					}
				}
				case GetPhysicsRBDPropertyActorNodeInputName.linearDamping: {
					return body?.linearDamping() || 0;
				}
				case GetPhysicsRBDPropertyActorNodeInputName.angularDamping: {
					return body?.angularDamping() || 0;
				}
				case GetPhysicsRBDPropertyActorNodeInputName.isSleeping: {
					return body?.isSleeping() || false;
				}
				case GetPhysicsRBDPropertyActorNodeInputName.isMoving: {
					return body?.isMoving() || false;
				}
			}
			TypeAssert.unreachable(outputName);
		} else {
			return 0;
		}
	}
}
