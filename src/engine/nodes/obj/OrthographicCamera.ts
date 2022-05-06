/**
 * Creates an orthographic camera.
 *
 *
 */
import {OrthographicCamera} from 'three';
import {TypedThreejsCameraObjNode, ThreejsCameraTransformParamConfig, CameraMainCameraParamConfig} from './_BaseCamera';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CameraRenderParamConfig} from './utils/cameras/RenderController';
import {LayerParamConfig} from './utils/LayersController';
import {TransformedParamConfig} from './utils/TransformController';
import {CameraNodeType} from '../../poly/NodeContext';
import {CameraPostProcessParamConfig} from './utils/cameras/PostProcessParamOptions';
import {
	OrthographicCameraParamConfigMixin,
	ORTHOGRAPHIC_CAMERA_DEFAULT,
	registerOrthographicCamera,
} from '../../../core/camera/CoreOrthographicCamera';
import {CORE_CAMERA_DEFAULT} from '../../../core/camera/CoreCamera';
import {CoreCameraFrameParamConfig} from '../../../core/camera/CoreCameraFrameMode';
import {OrthographicCameraSopOperation} from '../../operations/sop/OrthographicCamera';

class OrthographicCameraObjParamConfig extends CameraPostProcessParamConfig(
	CameraRenderParamConfig(
		LayerParamConfig(
			CameraMainCameraParamConfig(
				CoreCameraFrameParamConfig(
					OrthographicCameraParamConfigMixin(
						ThreejsCameraTransformParamConfig(
							TransformedParamConfig(NodeParamsConfig, {matrixAutoUpdate: true})
						)
					)
				)
			)
		)
	)
) {}
const ParamsConfig = new OrthographicCameraObjParamConfig();

export class OrthographicCameraObjNode extends TypedThreejsCameraObjNode<
	OrthographicCamera,
	OrthographicCameraObjParamConfig
> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<CameraNodeType.ORTHOGRAPHIC> {
		return CameraNodeType.ORTHOGRAPHIC;
	}
	static override onRegister = registerOrthographicCamera;

	override createObject() {
		return new OrthographicCamera(
			ORTHOGRAPHIC_CAMERA_DEFAULT.left * 2,
			ORTHOGRAPHIC_CAMERA_DEFAULT.right * 2,
			ORTHOGRAPHIC_CAMERA_DEFAULT.top * 2,
			ORTHOGRAPHIC_CAMERA_DEFAULT.bottom * 2,
			CORE_CAMERA_DEFAULT.near,
			CORE_CAMERA_DEFAULT.far
		);
	}

	override updateCamera() {
		OrthographicCameraSopOperation.setCameraAttributes(this._object, this.pv);

		// this._updateForAspectRatio();
	}

	// protected override _updateForAspectRatio() {
	// 	CoreCameraOrthographicFrameMode.updateCameraAspect(this._object, this._aspect);
	// }
}
