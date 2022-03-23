/**
 * Update the object scale
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Vector3} from 'three/src/math/Vector3';
import {isBooleanTrue} from '../../../core/Type';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetObjectScaleActorParamsConfig extends NodeParamsConfig {
	/** @param target scale */
	scale = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param target scale */
	mult = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [false, false],
	});
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetObjectScaleActorParamsConfig();

const tmpS = new Vector3();
export class SetObjectScaleActorNode extends TypedActorNode<SetObjectScaleActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectScale';
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
		const {Object3D} = context;
		const scale = this._inputValueFromParam<ParamType.VECTOR3>(this.p.scale, context);
		const mult = this._inputValueFromParam<ParamType.FLOAT>(this.p.mult, context);
		const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);
		const updateMatrix = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.updateMatrix, context);
		tmpS.copy(scale).multiplyScalar(mult);
		Object3D.scale.lerp(tmpS, lerp);
		if (isBooleanTrue(updateMatrix)) {
			Object3D.updateMatrix();
		}
		this.runTrigger(context);
	}
}
