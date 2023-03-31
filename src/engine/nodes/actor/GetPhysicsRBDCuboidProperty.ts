/**
 * get an RBD cuboid property
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
import {_getPhysicsRBDCuboidSizes} from '../../../core/physics/shapes/RBDCuboid';
import {TypeAssert} from '../../poly/Assert';
import {Vector3} from 'three';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export enum GetPhysicsRBDCuboidPropertyActorNodeInputName {
	sizes = 'sizes',
}
const PROPERTIES: GetPhysicsRBDCuboidPropertyActorNodeInputName[] = [
	GetPhysicsRBDCuboidPropertyActorNodeInputName.sizes,
];

let target = new Vector3();
export class GetPhysicsRBDCuboidPropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getPhysicsRBDCuboidproperty';
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
				GetPhysicsRBDCuboidPropertyActorNodeInputName.sizes,
				ActorConnectionPointType.VECTOR3
			),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetPhysicsRBDCuboidPropertyActorNodeInputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		if (PROPERTIES.includes(outputName as GetPhysicsRBDCuboidPropertyActorNodeInputName)) {
			switch (outputName) {
				case GetPhysicsRBDCuboidPropertyActorNodeInputName.sizes: {
					_getPhysicsRBDCuboidSizes(Object3D, target);
					return target;
				}
			}
			TypeAssert.unreachable(outputName);
		} else {
			return 0;
		}
	}
}
