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
	CameraMasterCameraParamConfig,
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

export function PerspectiveCameraObjParamConfigMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param field of view */
		fov = ParamConfig.FLOAT(DEFAULT.fov, {range: [0, 100]});
		// vertical_fov_range = ParamConfig.VECTOR2([0, 100], {visibleIf: {lock_width: 1}});
		// horizontal_fov_range = ParamConfig.VECTOR2([0, 100], {visibleIf: {lock_width: 0}});
	};
}
class PerspectiveCameraObjParamConfig extends CameraPostProcessParamConfig(
	CameraRenderParamConfig(
		LayerParamConfig(
			CameraMasterCameraParamConfig(
				PerspectiveCameraObjParamConfigMixin(
					ThreejsCameraTransformParamConfig(
						TransformedParamConfig(NodeParamsConfig, {matrixAutoUpdate: true})
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
	params_config = ParamsConfig;
	static type(): Readonly<CameraNodeType.PERSPECTIVE> {
		return CameraNodeType.PERSPECTIVE;
	}

	create_object() {
		return new PerspectiveCamera(DEFAULT.fov, 1, BASE_CAMERA_DEFAULT.near, BASE_CAMERA_DEFAULT.far);
	}

	update_camera() {
		if (this._object.fov != this.pv.fov) {
			this._object.fov = this.pv.fov;
			this._object.updateProjectionMatrix();
		}
		this._update_for_aspect_ratio();
	}

	protected _update_for_aspect_ratio() {
		if (this._aspect) {
			// let lock_width = true;//this.pv.lock_width;

			this._object.aspect = this._aspect;
			// if (lock_width) {
			// 	const other_fov = this.pv.fov / this._aspect;
			// 	this._object.zoom = this.get_zoom(this._aspect, other_fov, this.pv.vertical_fov_range);
			// } else {
			// 	this._object.zoom = 1;
			// }
			this._object.updateProjectionMatrix();
		}
	}
	// private get_zoom(start_zoom: number, other_fov: number, range: Vector2) {
	// 	let zoom = start_zoom;
	// 	if (range) {
	// 		if (other_fov < range.x || other_fov > range.y) {
	// 			const new_other_fov = lodash_clamp(other_fov, range.x, range.y);
	// 			zoom = start_zoom * (other_fov / new_other_fov);
	// 			// zoom = Math.min(start_zoom, zoom)
	// 		}
	// 	}
	// 	return zoom;
	// }
}
