/**
 * Creates a perspective camera.
 *
 *
 */
import {PerspectiveCamera} from 'three';
import {TypedThreejsCameraObjNode, ThreejsCameraTransformParamConfig, CameraMainCameraParamConfig} from './_BaseCamera';

// const EVENT_CHANGE = { type: 'change' };
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CameraRenderParamConfig} from './utils/cameras/RenderController';
import {LayerParamConfig} from './utils/LayersController';
import {TransformedParamConfig} from './utils/TransformController';
import {CameraNodeType} from '../../poly/NodeContext';
import {CameraPostProcessParamConfig} from './utils/cameras/PostProcessParamOptions';
import {
	PerspectiveCameraParamConfigMixin,
	PERSPECTIVE_CAMERA_DEFAULT,
	registerPerspectiveCamera,
} from '../../../core/camera/CorePerspectiveCamera';
import {CORE_CAMERA_DEFAULT} from '../../../core/camera/CoreCamera';
import {CoreCameraFrameParamConfig} from '../../../core/camera/CoreCameraFrameMode';
import {PerspectiveCameraSopOperation} from '../../operations/sop/PerspectiveCamera';
import {OnNodeRegisterCallback} from '../../poly/registers/nodes/NodesRegister';

class PerspectiveCameraObjParamConfig extends CameraPostProcessParamConfig(
	CameraRenderParamConfig(
		LayerParamConfig(
			CameraMainCameraParamConfig(
				CoreCameraFrameParamConfig(
					PerspectiveCameraParamConfigMixin(
						ThreejsCameraTransformParamConfig(
							TransformedParamConfig(NodeParamsConfig, {matrixAutoUpdate: true})
						)
					)
				)
			)
		)
	)
) {}
const ParamsConfig = new PerspectiveCameraObjParamConfig();

export class PerspectiveCameraObjNode extends TypedThreejsCameraObjNode<
	PerspectiveCamera,
	PerspectiveCameraObjParamConfig
> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<CameraNodeType.PERSPECTIVE> {
		return CameraNodeType.PERSPECTIVE;
	}
	static override onRegister: OnNodeRegisterCallback = registerPerspectiveCamera;

	override createObject() {
		const camera = PerspectiveCameraSopOperation.createCamera(
			{
				...PERSPECTIVE_CAMERA_DEFAULT,
				...CORE_CAMERA_DEFAULT,
			},
			this
		);
		PerspectiveCameraSopOperation.setCameraAttributes(camera, {fov: PERSPECTIVE_CAMERA_DEFAULT.fov});
		return camera;
	}

	override updateCamera() {
		if (this._object.fov != this.pv.fov) {
			this._object.fov = this.pv.fov;
			PerspectiveCameraSopOperation.setCameraAttributes(this._object, this.pv);
			this._object.updateProjectionMatrix();
		}
	}

	// protected override _updateForAspectRatio() {
	// 	CoreCameraPerspectiveFrameMode.updateCameraAspect(this._object, this._aspect);
	// }
}
