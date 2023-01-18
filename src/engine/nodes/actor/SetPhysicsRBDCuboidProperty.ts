/**
 * Updates a Physics RBD cuboid property
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
import {setPhysicsRBDCuboidProperty} from '../../../core/physics/shapes/RBDCuboid';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetPhysicsRBDCuboidPropertyActorParamsConfig extends NodeParamsConfig {
	/** @param target sizes */
	sizes = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param target size */
	size = ParamConfig.FLOAT(1);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetPhysicsRBDCuboidPropertyActorParamsConfig();

export class SetPhysicsRBDCuboidPropertyActorNode extends TypedActorNode<SetPhysicsRBDCuboidPropertyActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPhysicsRBDCuboidProperty';
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
		const sizes = this._inputValueFromParam<ParamType.VECTOR3>(this.p.sizes, context);
		const size = this._inputValueFromParam<ParamType.FLOAT>(this.p.size, context);
		const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);
		const updateMatrix = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.updateMatrix, context);

		setPhysicsRBDCuboidProperty(Object3D, sizes, size, lerp, updateMatrix);

		this.runTrigger(context);
	}
}
