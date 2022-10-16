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
import {physicsRBDAddForceAtPoint} from '../../../core/physics/PhysicsRBD';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class PhysicsRBDAddForceAtPointActorParamsConfig extends NodeParamsConfig {
	/** @param force */
	force = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param point */
	point = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new PhysicsRBDAddForceAtPointActorParamsConfig();

export class PhysicsRBDAddForceAtPointActorNode extends TypedActorNode<PhysicsRBDAddForceAtPointActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'physicsRBDAddForceAtPoint';
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
		const force = this._inputValueFromParam<ParamType.VECTOR3>(this.p.force, context);
		const point = this._inputValueFromParam<ParamType.VECTOR3>(this.p.point, context);

		physicsRBDAddForceAtPoint(Object3D, force, point);

		this.runTrigger(context);
	}
}
