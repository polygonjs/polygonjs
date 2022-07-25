/**
 * Update the camera near/far
 *
 *
 */
import {PerspectiveCamera} from 'three';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/Type';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetPerspectiveCameraFovActorParamsConfig extends NodeParamsConfig {
	/** @param focal length */
	fov = ParamConfig.FLOAT(50);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the projection matrix should be updated as the animation progresses */
	updateProjectionMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetPerspectiveCameraFovActorParamsConfig();

export class SetPerspectiveCameraFovActorNode extends TypedActorNode<SetPerspectiveCameraFovActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPerspectiveCameraFov';
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
		const fov = this._inputValueFromParam<ParamType.FLOAT>(this.p.fov, context);
		const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);
		const updateProjectionMatrix = this._inputValueFromParam<ParamType.BOOLEAN>(
			this.p.updateProjectionMatrix,
			context
		);

		if (Object3D instanceof PerspectiveCamera) {
			const perspectiveCamera = Object3D as PerspectiveCamera;
			const newFov = lerp * fov + (1 - lerp) * perspectiveCamera.fov;
			perspectiveCamera.fov = newFov;
			if (isBooleanTrue(updateProjectionMatrix)) {
				perspectiveCamera.updateProjectionMatrix();
			}
		}

		this.runTrigger(context);
	}
}
