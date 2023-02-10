/**
 * Updates a Physics RBD position
 *
 *
 */
import {ParamConfig} from './../utils/params/ParamsConfig';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
import {setPhysicsRBDAngularVelocity} from '../../../core/physics/PhysicsRBD';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetPhysicsRBDAngularVelocityActorParamsConfig extends NodeParamsConfig {
	/** @param target velocity */
	velocity = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetPhysicsRBDAngularVelocityActorParamsConfig();

export class SetPhysicsRBDAngularVelocityActorNode extends TypedActorNode<SetPhysicsRBDAngularVelocityActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPhysicsRBDAngularVelocity';
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
		const position = this._inputValueFromParam<ParamType.VECTOR3>(this.p.velocity, context);
		const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);

		setPhysicsRBDAngularVelocity(Object3D, position, lerp);

		this.runTrigger(context);
	}
}
