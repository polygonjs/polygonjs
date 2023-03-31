/**
 * get an RBD cylinder property
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
import {_getPhysicsRBDCylinderHeight, _getPhysicsRBDCylinderRadius} from '../../../core/physics/shapes/RBDCylinder';
import {TypeAssert} from '../../poly/Assert';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export enum GetPhysicsRBDCylinderPropertyActorNodeInputName {
	height = 'height',
	radius = 'radius',
}
const PROPERTIES: GetPhysicsRBDCylinderPropertyActorNodeInputName[] = [
	GetPhysicsRBDCylinderPropertyActorNodeInputName.radius,
	GetPhysicsRBDCylinderPropertyActorNodeInputName.height,
];

export class GetPhysicsRBDCylinderPropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getPhysicsRBDCylinderproperty';
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
				GetPhysicsRBDCylinderPropertyActorNodeInputName.radius,
				ActorConnectionPointType.FLOAT
			),
			new ActorConnectionPoint(
				GetPhysicsRBDCylinderPropertyActorNodeInputName.height,
				ActorConnectionPointType.FLOAT
			),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetPhysicsRBDCylinderPropertyActorNodeInputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		if (PROPERTIES.includes(outputName as GetPhysicsRBDCylinderPropertyActorNodeInputName)) {
			switch (outputName) {
				case GetPhysicsRBDCylinderPropertyActorNodeInputName.radius: {
					return _getPhysicsRBDCylinderRadius(Object3D);
				}
				case GetPhysicsRBDCylinderPropertyActorNodeInputName.height: {
					return _getPhysicsRBDCylinderHeight(Object3D);
				}
			}
			TypeAssert.unreachable(outputName);
		} else {
			return 0;
		}
	}
}
