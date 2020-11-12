// import {Vector2} from 'three/src/math/Vector2';
import {OrthographicCamera} from 'three/src/cameras/OrthographicCamera';
// import {Group} from 'three/src/objects/Group';
// import {CameraHelper} from 'three/src/helpers/CameraHelper';
// import lodash_clamp from 'lodash/clamp';
import {
	TypedThreejsCameraObjNode,
	BASE_CAMERA_DEFAULT,
	ThreejsCameraTransformParamConfig,
	CameraMasterCameraParamConfig,
} from './_BaseCamera';

// import {OrthographicCameraBackgroundController} from './utils/cameras/background/OrthographicCameraController';
// import {ParamType} from '../../poly/ParamType';

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
			OrthographicCameraObjParamConfigMixin(
				CameraMasterCameraParamConfig(
					ThreejsCameraTransformParamConfig(
						TransformedParamConfig(NodeParamsConfig, {matrix_auto_update: true})
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
	params_config = ParamsConfig;

	// protected get background_controller_constructor() {
	// 	return OrthographicCameraBackgroundController;
	// }

	static type(): Readonly<CameraNodeType.ORTHOGRAPHIC> {
		return CameraNodeType.ORTHOGRAPHIC;
	}

	create_object() {
		return new OrthographicCamera(
			DEFAULT.left * 2,
			DEFAULT.right * 2,
			DEFAULT.top * 2,
			DEFAULT.bottom * 2,
			BASE_CAMERA_DEFAULT.near,
			BASE_CAMERA_DEFAULT.far
		);
	}

	update_camera() {
		this._update_for_aspect_ratio();
	}

	protected _update_for_aspect_ratio() {
		if (this._aspect) {
			const size = this.pv.size || 1;
			// let lock_width = this.pv.lock_width;
			// if (lock_width == null) {
			// 	lock_width = true;
			// }
			// if (lock_width) {
			// 	const vertical_size = size / this._aspect;
			// 	const zoom = 1 //this.get_zoom(vertical_size, this.pv.vertical_size_range);
			// 	this._object.left = DEFAULT.left * size * zoom;
			// 	this._object.right = DEFAULT.right * size * zoom;
			// 	this._object.top = DEFAULT.top * vertical_size * zoom;
			// 	this._object.bottom = DEFAULT.bottom * vertical_size * zoom;
			// } else {
			const horizontal_size = size * this._aspect;
			const zoom = 1; //this.get_zoom(horizontal_size, this.pv.horizontal_size_range);
			this._object.left = DEFAULT.left * horizontal_size * zoom;
			this._object.right = DEFAULT.right * horizontal_size * zoom;
			this._object.top = DEFAULT.top * size * zoom;
			this._object.bottom = DEFAULT.bottom * size * zoom;
			// }
			this._object.updateProjectionMatrix();
		}
	}

	// private get_zoom(size: number, range: Vector2) {
	// 	let zoom = 1;
	// 	if (range) {
	// 		if (size < range.x || size > range.y) {
	// 			const new_size = lodash_clamp(size, range.x, range.y);
	// 			zoom = new_size / size;
	// 		}
	// 	}
	// 	return zoom;
	// }
}
