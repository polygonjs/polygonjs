/**
 * Applies an impulse to a Physics RBD
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
import {physicsRBDResetTorques} from '../../../core/physics/PhysicsRBD';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class PhysicsRBDResetTorquesActorParamsConfig extends NodeParamsConfig {
	/** @param wakeup */
	wakeup = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new PhysicsRBDResetTorquesActorParamsConfig();

export class PhysicsRBDResetTorquesActorNode extends TypedActorNode<PhysicsRBDResetTorquesActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'physicsRBDResetTorques';
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
		const wakeup = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.wakeup, context);

		physicsRBDResetTorques(Object3D, wakeup);

		this.runTrigger(context);
	}
}
