/**
 * get an RBD capsule property
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
import {getPhysicsRBDCapsuleRadius, getPhysicsRBDCapsuleHeight} from '../../../core/physics/shapes/RBDCapsule';
import {TypeAssert} from '../../poly/Assert';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export enum GetPhysicsRBDCapsulePropertyActorNodeInputName {
	radius = 'radius',
	height = 'height',
}
const PROPERTIES: GetPhysicsRBDCapsulePropertyActorNodeInputName[] = [
	GetPhysicsRBDCapsulePropertyActorNodeInputName.radius,
];

export class GetPhysicsRBDCapsulePropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getPhysicsRBDCapsuleproperty';
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
				GetPhysicsRBDCapsulePropertyActorNodeInputName.radius,
				ActorConnectionPointType.FLOAT
			),
			new ActorConnectionPoint(
				GetPhysicsRBDCapsulePropertyActorNodeInputName.height,
				ActorConnectionPointType.FLOAT
			),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetPhysicsRBDCapsulePropertyActorNodeInputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		if (PROPERTIES.includes(outputName as GetPhysicsRBDCapsulePropertyActorNodeInputName)) {
			switch (outputName) {
				case GetPhysicsRBDCapsulePropertyActorNodeInputName.radius: {
					return getPhysicsRBDCapsuleRadius(Object3D) || 0;
				}
				case GetPhysicsRBDCapsulePropertyActorNodeInputName.height: {
					return getPhysicsRBDCapsuleHeight(Object3D) || 0;
				}
			}
			TypeAssert.unreachable(outputName);
		} else {
			return 0;
		}
	}
}
