/**
 * get an RBD cone property
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
import {getPhysicsRBDConeHeight, getPhysicsRBDConeRadius} from '../../../core/physics/shapes/RBDCone';
import {TypeAssert} from '../../poly/Assert';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export enum GetPhysicsRBDConePropertyActorNodeInputName {
	height = 'height',
	radius = 'radius',
}
const PROPERTIES: GetPhysicsRBDConePropertyActorNodeInputName[] = [
	GetPhysicsRBDConePropertyActorNodeInputName.radius,
	GetPhysicsRBDConePropertyActorNodeInputName.height,
];

export class GetPhysicsRBDConePropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getPhysicsRBDConeproperty';
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
				GetPhysicsRBDConePropertyActorNodeInputName.radius,
				ActorConnectionPointType.FLOAT
			),
			new ActorConnectionPoint(
				GetPhysicsRBDConePropertyActorNodeInputName.height,
				ActorConnectionPointType.FLOAT
			),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetPhysicsRBDConePropertyActorNodeInputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		if (PROPERTIES.includes(outputName as GetPhysicsRBDConePropertyActorNodeInputName)) {
			switch (outputName) {
				case GetPhysicsRBDConePropertyActorNodeInputName.radius: {
					return getPhysicsRBDConeRadius(Object3D);
				}
				case GetPhysicsRBDConePropertyActorNodeInputName.height: {
					return getPhysicsRBDConeHeight(Object3D);
				}
			}
			TypeAssert.unreachable(outputName);
		} else {
			return 0;
		}
	}
}
