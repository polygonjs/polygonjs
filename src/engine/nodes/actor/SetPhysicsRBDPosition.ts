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
import {setPhysicsRBDPosition} from '../../../core/physics/PhysicsRBD';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetPhysicsRBDPositionActorParamsConfig extends NodeParamsConfig {
	/** @param target position */
	position = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetPhysicsRBDPositionActorParamsConfig();

export class SetPhysicsRBDPositionActorNode extends TypedActorNode<SetPhysicsRBDPositionActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.SET_PHYSICS_RBD_POSITION;
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
		const position = this._inputValueFromParam<ParamType.VECTOR3>(this.p.position, context);
		const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);

		setPhysicsRBDPosition(Object3D, position, lerp);

		this.runTrigger(context);
	}
}
