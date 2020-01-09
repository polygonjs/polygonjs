import lodash_clamp from 'lodash/clamp';

import {Vector2} from 'three/src/math/Vector2';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
const THREE = {PerspectiveCamera, Vector2};
import {BaseCameraObjNode, BASE_CAMERA_DEFAULT} from './_BaseCamera';
import {PerspectiveCameraBackgroundController} from './utils/cameras/background/PerspectiveCameraController';

const DEFAULT = {
	fov: 50,
};

// const EVENT_CHANGE = { type: 'change' };

export class PerspectiveCameraObj extends BaseCameraObjNode {
	static type() {
		return 'perspective_camera';
	}

	_object: THREE.PerspectiveCamera;
	_param_fov: number;
	_param_vertical_fov_range: THREE.Vector2;
	_param_horizontal_fov_range: THREE.Vector2;

	protected get background_controller_constructor() {
		return PerspectiveCameraBackgroundController;
	}

	constructor() {
		super();
	}

	create_object() {
		return new THREE.PerspectiveCamera(DEFAULT.fov, 1, BASE_CAMERA_DEFAULT.near, BASE_CAMERA_DEFAULT.far);
	}

	create_params() {
		this.create_common_params();

		this.within_param_folder('render', () => {
			this.add_param(ParamType.FLOAT, 'fov', DEFAULT.fov, {
				range: [0, 180],
				range_locked: [true, true],
			});
			this.add_param(ParamType.VECTOR2, 'vertical_fov_range', [0, 100], {visible_if: {lock_width: 1}});
			this.add_param(ParamType.VECTOR2, 'horizontal_fov_range', [0, 100], {visible_if: {lock_width: 0}});

			this.create_player_camera_params();
		});
	}

	update_camera() {
		if (this._object.fov != this._param_fov) {
			this._object.fov = this._param_fov;
			this._object.updateProjectionMatrix();
		}
		this._update_for_aspect_ratio();
	}

	protected _update_for_aspect_ratio() {
		if (this._aspect) {
			let lock_width = this._param_lock_width;
			if (lock_width == null) {
				lock_width = true;
			}

			this._object.aspect = this._aspect;
			if (lock_width) {
				const other_fov = this._param_fov / this._aspect;
				this._object.zoom = this.get_zoom(this._aspect, other_fov, this._param_vertical_fov_range);
			} else {
				this._object.zoom = 1;
			}

			this._object.updateProjectionMatrix();
		}
	}
	private get_zoom(start_zoom: number, other_fov: number, range: THREE.Vector2) {
		let zoom = start_zoom;
		if (range) {
			if (other_fov < range.x || other_fov > range.y) {
				const new_other_fov = lodash_clamp(other_fov, range.x, range.y);
				zoom = start_zoom * (other_fov / new_other_fov);
				// zoom = Math.min(start_zoom, zoom)
			}
		}
		return zoom;
	}
}
