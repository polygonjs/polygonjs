/**
 * Updates a physics world gravity
 *
 *
 */
import {PHYSICS_GRAVITY_DEFAULT, setWorldGravity} from './../../../core/physics/PhysicsWorld';
import {ParamConfig} from './../utils/params/ParamsConfig';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetPhysicsWorldGravityActorParamsConfig extends NodeParamsConfig {
	gravity = ParamConfig.VECTOR3(PHYSICS_GRAVITY_DEFAULT);
	lerp = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new SetPhysicsWorldGravityActorParamsConfig();

export class SetPhysicsWorldGravityActorNode extends TypedActorNode<SetPhysicsWorldGravityActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPhysicsWorldGravity';
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
		const gravity = this._inputValueFromParam<ParamType.VECTOR3>(this.p.gravity, context);
		const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);

		setWorldGravity(Object3D, gravity, lerp);

		this.runTrigger(context);
	}
}
