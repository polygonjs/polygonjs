/**
 * Update the object rotation
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Quaternion, Euler} from 'three';
import {ROTATION_ORDERS, RotationOrder} from '../../../core/Transform';
import {isBooleanTrue} from '../../../core/Type';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetObjectRotationActorParamsConfig extends NodeParamsConfig {
	/** @param rotation order */
	rotationOrder = ParamConfig.INTEGER(ROTATION_ORDERS.indexOf(RotationOrder.XYZ), {
		menu: {
			entries: ROTATION_ORDERS.map((order, v) => {
				return {name: order, value: v};
			}),
		},
	});
	/** @param rotation */
	rotation = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetObjectRotationActorParamsConfig();

const tmpEuler = new Euler();
const q1 = new Quaternion();
const q2 = new Quaternion();
export class SetObjectRotationActorNode extends TypedActorNode<SetObjectRotationActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectRotation';
	}

	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['rotationOrder']);
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
		const rotation = this._inputValueFromParam<ParamType.VECTOR3>(this.p.rotation, context);
		const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);
		const updateMatrix = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.updateMatrix, context);
		tmpEuler.order = ROTATION_ORDERS[this.pv.rotationOrder];
		tmpEuler.set(rotation.x, rotation.y, rotation.z);

		if (lerp >= 1) {
			Object3D.quaternion.setFromEuler(tmpEuler, false);
		} else {
			q1.copy(Object3D.quaternion);
			q2.setFromEuler(tmpEuler, false);
			q1.slerp(q2, lerp);
			Object3D.quaternion.copy(q1);
		}

		if (isBooleanTrue(updateMatrix)) {
			Object3D.updateMatrix();
		}
		this.runTrigger(context);
	}
}
