/**
 * Updates a Physics RBD cone property
 *
 *
 */
import {ParamConfig} from '../utils/params/ParamsConfig';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
import {_setPhysicsRBDConeProperty} from '../../../core/physics/shapes/RBDCone';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetPhysicsRBDConePropertyActorParamsConfig extends NodeParamsConfig {
	/** @param target radius */
	radius = ParamConfig.FLOAT(1);
	/** @param target height */
	height = ParamConfig.FLOAT(1);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetPhysicsRBDConePropertyActorParamsConfig();

export class SetPhysicsRBDConePropertyActorNode extends TypedActorNode<SetPhysicsRBDConePropertyActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPhysicsRBDConeProperty';
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
		const radius = this._inputValueFromParam<ParamType.FLOAT>(this.p.radius, context);
		const height = this._inputValueFromParam<ParamType.FLOAT>(this.p.height, context);
		const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);
		const updateMatrix = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.updateMatrix, context);

		_setPhysicsRBDConeProperty(Object3D, radius, height, lerp, updateMatrix);

		this.runTrigger(context);
	}
}
