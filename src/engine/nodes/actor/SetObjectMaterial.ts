/**
 * Update the object material
 *
 *
 */

import {ActorNodeTriggerContext, ParamlessTypedActorNode, TRIGGER_CONNECTION_NAME} from './_Base';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {Mesh} from 'three/src/objects/Mesh';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export class SetObjectMaterialActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'setObjectMaterial';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
			new ActorConnectionPoint(
				ActorConnectionPointType.MATERIAL,
				ActorConnectionPointType.MATERIAL,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const material = this._inputValue<ActorConnectionPointType.MATERIAL>(
			ActorConnectionPointType.MATERIAL,
			context
		);
		if (material) {
			(Object3D as Mesh).material = material;
		}
		this.runTrigger(context);
	}
}
