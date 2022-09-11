/**
 * Initializes a physics simulation
 *
 *
 */
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {getPhysicsWorldNodeFromWorldObject} from '../sop/PhysicsWorld';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class PhysicsWorldResetActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new PhysicsWorldResetActorParamsConfig();

export class PhysicsWorldResetActorNode extends TypedActorNode<PhysicsWorldResetActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'physicsWorldReset';
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

		const physicsWorldNode = getPhysicsWorldNodeFromWorldObject(Object3D, this.scene());
		if (!physicsWorldNode) {
			console.warn(`no ${SopType.PHYSICS_WORLD} node found`);
			return;
		}
		physicsWorldNode.setDirty();
	}
}
