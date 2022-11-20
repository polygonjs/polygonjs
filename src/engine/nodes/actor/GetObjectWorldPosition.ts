/**
 * get an object world position
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
import {Vector3} from 'three';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

enum GetObjectWorldPositionActorNodeInputName {
	worldPosition = 'worldPosition',
}

const tmpV3 = new Vector3();
export class GetObjectWorldPositionActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getObjectWorldPosition';
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
				GetObjectWorldPositionActorNodeInputName.worldPosition,
				ActorConnectionPointType.VECTOR3
			),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetObjectWorldPositionActorNodeInputName | string
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;

		Object3D.getWorldPosition(tmpV3);
		return tmpV3;
	}
}
