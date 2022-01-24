/**
 * Creates a perspective camera.
 *
 *
 */
import {Constructor} from '../../../types/GlobalTypes';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
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
	fov: 50,
};

// const EVENT_CHANGE = { type: 'change' };
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CameraRenderParamConfig} from './utils/cameras/RenderController';
import {CameraPostProcessParamConfig} from './utils/cameras/PostProcessController';
import {LayerParamConfig} from './utils/LayersController';
import {TransformedParamConfig} from './utils/TransformController';
import {CameraNodeType} from '../../poly/NodeContext';
import {radToDeg, degToRad} from 'three/src/math/MathUtils';
import {TypeAssert} from '../../poly/Assert';

export function PerspectiveCameraObjParamConfigMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param field of view */
		fov = ParamConfig.FLOAT(DEFAULT.fov, {range: [0, 100]});
	};
}
class PerspectiveCameraObjParamConfig extends CameraPostProcessParamConfig(
	CameraRenderParamConfig(
		LayerParamConfig(
			CameraMainCameraParamConfig(
				ThreejsCameraFOVParamConfig(
					PerspectiveCameraObjParamConfigMixin(
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

	override createObject() {
		return new PerspectiveCamera(DEFAULT.fov, 1, BASE_CAMERA_DEFAULT.near, BASE_CAMERA_DEFAULT.far);
	}

	override updateCamera() {
		if (this._object.fov != this.pv.fov) {
			this._object.fov = this.pv.fov;
			this._object.updateProjectionMatrix();
		}
		this._updateForAspectRatio();
	}

	protected override _updateForAspectRatio() {
		if (this._aspect) {
			this._object.aspect = this._aspect;
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
		this._object.fov = this.pv.fov;
	}
	private _adjustFOVFromModeCover() {
		// from
		// https://discourse.threejs.org/t/keeping-an-object-scaled-based-on-the-bounds-of-the-canvas-really-battling-to-explain-this-one/17574/10
		//
		if (this._object.aspect > this.pv.expectedAspectRatio) {
			// window too large
			const cameraHeight = Math.tan(degToRad(this.pv.fov / 2));
			const ratio = this._object.aspect / this.pv.expectedAspectRatio;
			const newCameraHeight = cameraHeight / ratio;
			this._object.fov = radToDeg(Math.atan(newCameraHeight)) * 2;
		} else {
			this._object.fov = this.pv.fov;
		}
	}
	private _adjustFOVFromModeContain() {
		if (this._object.aspect > this.pv.expectedAspectRatio) {
			// window too large
			this._object.fov = this.pv.fov;
		} else {
			// window too narrow
			const cameraHeight = Math.tan(degToRad(this.pv.fov / 2));
			const ratio = this._object.aspect / this.pv.expectedAspectRatio;
			const newCameraHeight = cameraHeight / ratio;
			this._object.fov = radToDeg(Math.atan(newCameraHeight)) * 2;
		}
	}
}
