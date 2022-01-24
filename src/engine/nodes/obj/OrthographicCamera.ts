/**
 * Creates an orthographic camera.
 *
 *
 */
import {Constructor} from '../../../types/GlobalTypes';
import {OrthographicCamera} from 'three/src/cameras/OrthographicCamera';
import {
	TypedThreejsCameraObjNode,
	BASE_CAMERA_DEFAULT,
	ThreejsCameraTransformParamConfig,
	ThreejsCameraFOVParamConfig,
	CameraMainCameraParamConfig,
	FOV_ADJUST_MODES,
	FOVAdjustMode,
} from './_BaseCamera';

const DEFAULT = {
	left: -0.5,
	right: 0.5,
	top: 0.5,
	bottom: -0.5,
};

import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CameraRenderParamConfig} from './utils/cameras/RenderController';
import {CameraPostProcessParamConfig} from './utils/cameras/PostProcessController';
import {LayerParamConfig} from './utils/LayersController';
import {TransformedParamConfig} from './utils/TransformController';
import {CameraNodeType} from '../../poly/NodeContext';
import {TypeAssert} from '../../poly/Assert';
export function OrthographicCameraObjParamConfigMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		size = ParamConfig.FLOAT(1);
		// vertical_size_range = ParamConfig.VECTOR2([-1, -1]);
		// horizontal_size_range = ParamConfig.VECTOR2([-1, -1]);
	};
}

class OrthographicCameraObjParamConfig extends CameraPostProcessParamConfig(
	CameraRenderParamConfig(
		LayerParamConfig(
			CameraMainCameraParamConfig(
				ThreejsCameraFOVParamConfig(
					OrthographicCameraObjParamConfigMixin(
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

	// protected get background_controller_constructor() {
	// 	return OrthographicCameraBackgroundController;
	// }

	static override type(): Readonly<CameraNodeType.ORTHOGRAPHIC> {
		return CameraNodeType.ORTHOGRAPHIC;
	}

	override createObject() {
		return new OrthographicCamera(
			DEFAULT.left * 2,
			DEFAULT.right * 2,
			DEFAULT.top * 2,
			DEFAULT.bottom * 2,
			BASE_CAMERA_DEFAULT.near,
			BASE_CAMERA_DEFAULT.far
		);
	}

	override updateCamera() {
		this._updateForAspectRatio();
	}

	protected override _updateForAspectRatio() {
		if (this._aspect) {
			this._adjustFOVFromMode();
			this._object.updateProjectionMatrix();
		}
	}

	private _adjustFOVFromMode() {
		const mode: FOVAdjustMode = FOV_ADJUST_MODES[this.pv.fovAdjustMode];
		switch (mode) {
			case FOVAdjustMode.DEFAULT: {
				return this._adjustFOVFromModeDefault();
			}
			case FOVAdjustMode.COVER: {
				return this._adjustFOVFromModeCover();
			}
			case FOVAdjustMode.CONTAIN: {
				return this._adjustFOVFromModeContain();
			}
		}
		TypeAssert.unreachable(mode);
	}
	private _adjustFOVFromModeDefault() {
		this._adjustFOVFromSize(this.pv.size || 1);
	}
	private _adjustFOVFromModeCover() {
		const size = this.pv.size || 1;
		if (this._aspect > this.pv.expectedAspectRatio) {
			// window too large
			this._adjustFOVFromSize((this.pv.expectedAspectRatio * size) / this._aspect);
		} else {
			// window too narrow
			this._adjustFOVFromSize(size);
		}
	}
	private _adjustFOVFromModeContain() {
		const size = this.pv.size || 1;
		if (this._aspect > this.pv.expectedAspectRatio) {
			// window too large
			this._adjustFOVFromSize(size);
		} else {
			// window too narrow
			this._adjustFOVFromSize((this.pv.expectedAspectRatio * size) / this._aspect);
		}
	}

	private _adjustFOVFromSize(size: number) {
		const horizontal_size = size * this._aspect;
		const zoom = 1;
		this._object.left = DEFAULT.left * horizontal_size * zoom;
		this._object.right = DEFAULT.right * horizontal_size * zoom;
		this._object.top = DEFAULT.top * size * zoom;
		this._object.bottom = DEFAULT.bottom * size * zoom;
	}
}
