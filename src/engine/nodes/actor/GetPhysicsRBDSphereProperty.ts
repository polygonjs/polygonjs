/**
 * get an RBD property
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
import {getPhysicsRBDSphereRadius} from '../../../core/physics/shapes/RBDSphere';
import {TypeAssert} from '../../poly/Assert';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export enum GetPhysicsRBDSpherePropertyActorNodeInputName {
	radius = 'radius',
}
const PROPERTIES: GetPhysicsRBDSpherePropertyActorNodeInputName[] = [
	GetPhysicsRBDSpherePropertyActorNodeInputName.radius,
];

export class GetPhysicsRBDSpherePropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getPhysicsRBDSphereproperty';
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
				GetPhysicsRBDSpherePropertyActorNodeInputName.radius,
				ActorConnectionPointType.FLOAT
			),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetPhysicsRBDSpherePropertyActorNodeInputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		if (PROPERTIES.includes(outputName as GetPhysicsRBDSpherePropertyActorNodeInputName)) {
			switch (outputName) {
				case GetPhysicsRBDSpherePropertyActorNodeInputName.radius: {
					return getPhysicsRBDSphereRadius(Object3D) || 0;
				}
			}
			TypeAssert.unreachable(outputName);
		} else {
			return 0;
		}
	}
}
