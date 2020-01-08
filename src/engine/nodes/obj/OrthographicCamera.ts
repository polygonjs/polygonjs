import {Vector2} from 'three/src/math/Vector2';
import {OrthographicCamera} from 'three/src/cameras/OrthographicCamera';
import {Group} from 'three/src/objects/Group';
import {CameraHelper} from 'three/src/helpers/CameraHelper';
const THREE = {CameraHelper, Group, OrthographicCamera, Vector2};
import lodash_clamp from 'lodash/clamp';
import {BaseCamera, BASE_CAMERA_DEFAULT} from './_BaseCamera';
import lodash_isNaN from 'lodash/isNaN';

import {OrthographicCameraBackgroundController} from './utils/cameras/background/OrthographicCameraController';

const DEFAULT = {
	left: -0.5,
	right: 0.5,
	top: 0.5,
	bottom: -0.5,
};

export class OrthographicCameraObj extends BaseCamera {
	_object: THREE.OrthographicCamera;
	_param_size: number;
	_param_vertical_size_range: THREE.Vector2;
	_param_horizontal_size_range: THREE.Vector2;

	protected get background_controller_constructor() {
		return OrthographicCameraBackgroundController;
	}

	constructor() {
		super();
	}
	static type() {
		return 'orthographic_camera';
	}

	create_object() {
		return new THREE.OrthographicCamera(
			DEFAULT.left * 2,
			DEFAULT.right * 2,
			DEFAULT.top * 2,
			DEFAULT.bottom * 2,
			BASE_CAMERA_DEFAULT.near,
			BASE_CAMERA_DEFAULT.far
		);
	}
	//@_helper = new THREE.CameraHelper( @_camera )
	//group = new THREE.Group()
	//group.add(@_camera)
	//group.add(@_helper)

	//this.set_object(@_camera)

	create_params() {
		this.create_common_params();
		// this.add_param('float', 'left', DEFAULT.left)
		// this.add_param('float', 'right', DEFAULT.right)
		// this.add_param('float', 'top', DEFAULT.top)
		// this.add_param('float', 'bottom', DEFAULT.bottom)

		this.within_param_folder('render', () => {
			this.add_param(ParamType.FLOAT, 'size', 2, {range: [0, 10]});
			// left : Number, right : Number, top : Number, bottom : Number, near : Number, far : Number
			this.add_param(ParamType.VECTOR2, 'vertical_size_range', [0, 10], {visible_if: {lock_width: 1}});
			this.add_param(ParamType.VECTOR2, 'horizontal_size_range', [0, 10], {visible_if: {lock_width: 0}});

			this.create_player_camera_params();
		});
	}

	update_camera() {
		this._update_for_aspect_ratio();
	}

	private _update_for_aspect_ratio() {
		if (this._aspect) {
			const size = this._param_size || 1;
			let lock_width = this._param_lock_width;
			if (lock_width == null) {
				lock_width = true;
			}

			if (lock_width) {
				const vertical_size = size / this._aspect;
				const zoom = this.get_zoom(vertical_size, this._param_vertical_size_range);
				this._object.left = DEFAULT.left * size * zoom;
				this._object.right = DEFAULT.right * size * zoom;
				this._object.top = DEFAULT.top * vertical_size * zoom;
				this._object.bottom = DEFAULT.bottom * vertical_size * zoom;
			} else {
				const horizontal_size = size * this._aspect;
				const zoom = this.get_zoom(horizontal_size, this._param_horizontal_size_range);
				this._object.left = DEFAULT.left * horizontal_size * zoom;
				this._object.right = DEFAULT.right * horizontal_size * zoom;
				this._object.top = DEFAULT.top * size * zoom;
				this._object.bottom = DEFAULT.bottom * size * zoom;
			}

			this._object.updateProjectionMatrix();
		}
	}

	private get_zoom(size: number, range: THREE.Vector2) {
		let zoom = 1;
		if (range) {
			if (size < range.x || size > range.y) {
				const new_size = lodash_clamp(size, range.x, range.y);
				zoom = new_size / size;
			}
		}
		return zoom;
	}
}
