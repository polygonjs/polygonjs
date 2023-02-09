/**
 * Removes an RBD from the physics
 *
 *
 */
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {physicsRBDRemove} from '../../../core/physics/PhysicsRBD';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class PhysicsRBDRemoveActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new PhysicsRBDRemoveActorParamsConfig();

export class PhysicsRBDRemoveActorNode extends TypedActorNode<PhysicsRBDRemoveActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'physicsRBDRemove';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
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

		physicsRBDRemove(Object3D);

		this.runTrigger(context);
	}
}
