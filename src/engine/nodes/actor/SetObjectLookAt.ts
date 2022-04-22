/**
 * Make object look at a position
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
import {Quaternion} from 'three';
import {isBooleanTrue} from '../../../core/Type';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetObjectLookAtActorParamsConfig extends NodeParamsConfig {
	/** @param targetPosition */
	targetPosition = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param up */
	up = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetObjectLookAtActorParamsConfig();

const q1 = new Quaternion();
const q2 = new Quaternion();
export class SetObjectLookAtActorNode extends TypedActorNode<SetObjectLookAtActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectLookAt';
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
		const targetPosition = this._inputValueFromParam<ParamType.VECTOR3>(this.p.targetPosition, context);
		const up = this._inputValueFromParam<ParamType.VECTOR3>(this.p.up, context);
		const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);
		const updateMatrix = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.updateMatrix, context);

		Object3D.up.copy(up);

		if (lerp >= 1) {
			Object3D.lookAt(targetPosition);
		} else {
			q1.copy(Object3D.quaternion);
			Object3D.lookAt(targetPosition);
			q2.copy(Object3D.quaternion);
			q1.slerp(q2, lerp);
			Object3D.quaternion.copy(q1);
		}

		if (isBooleanTrue(updateMatrix)) {
			Object3D.updateMatrix();
		}
		this.runTrigger(context);
	}
}
