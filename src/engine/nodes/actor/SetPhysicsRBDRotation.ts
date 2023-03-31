/**
 * Updates a Physics RBD position
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
import {_setPhysicsRBDRotation} from '../../../core/physics/PhysicsRBD';
import {Quaternion} from 'three';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
const tmpQuaternion = new Quaternion();
class SetPhysicsRBDRotationActorParamsConfig extends NodeParamsConfig {
	/** @param target rotation */
	quaternion = ParamConfig.VECTOR4([0, 0, 0, 0]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetPhysicsRBDRotationActorParamsConfig();

export class SetPhysicsRBDRotationActorNode extends TypedActorNode<SetPhysicsRBDRotationActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPhysicsRBDRotation';
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
		const quatAsVector4 = this._inputValueFromParam<ParamType.VECTOR4>(this.p.quaternion, context);
		const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);
		tmpQuaternion.x = quatAsVector4.x;
		tmpQuaternion.y = quatAsVector4.y;
		tmpQuaternion.z = quatAsVector4.z;
		tmpQuaternion.w = quatAsVector4.w;
		_setPhysicsRBDRotation(Object3D, tmpQuaternion, lerp);

		this.runTrigger(context);
	}
}
