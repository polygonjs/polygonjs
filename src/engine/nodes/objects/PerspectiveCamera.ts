import lodash_clamp from 'lodash/clamp'
import lodash_isNaN from 'lodash/isNaN'
import lodash_sum from 'lodash/sum'
import {Vector2} from 'three/src/math/Vector2'
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera'
const THREE = {PerspectiveCamera, Vector2}
import {BaseCamera, BASE_CAMERA_DEFAULT} from './_BaseCamera';
import {ParamType} from 'src/Engine/Param/_Module'

const DEFAULT = {
	fov: 50,
};

// const EVENT_CHANGE = { type: 'change' };

const SCREEN_COORD = {
	bl: {x: -1, y:-1},
	br: {x: +1, y:-1},
	tl: {x: -1, y:+1},
	tr: {x: +1, y:+1},
}
const CORNER_NAMES = ['bl', 'br', 'tl', 'tr']

export class PerspectiveCameraObj extends BaseCamera {
	static type() { return 'perspective_camera'; }

	_object: THREE.PerspectiveCamera
	_param_fov: number
	_param_vertical_fov_range: THREE.Vector2
	_param_horizontal_fov_range: THREE.Vector2

	constructor() {
		super();
	}

	create_object() {
		return new THREE.PerspectiveCamera(
			DEFAULT.fov,
			1,
			BASE_CAMERA_DEFAULT.near,
			BASE_CAMERA_DEFAULT.far
		);
	}

	create_params() {
		this.create_common_params();

		this.within_param_folder('render', ()=>{
			this.add_param( ParamType.FLOAT, 'fov', DEFAULT.fov, {
				range: [0, 180],
				range_locked: [true, true]
			});
			this.add_param(ParamType.VECTOR2, 'vertical_fov_range', [0, 100], {visible_if: {lock_width: 1}})
			this.add_param(ParamType.VECTOR2, 'horizontal_fov_range', [0, 100], {visible_if: {lock_width: 0}})

			this.create_player_camera_params();
		})
	}

	update_camera() {

		if(this._object.fov != this._param_fov){
			this._object.fov = this._param_fov
			this._object.updateProjectionMatrix();
		}
		this._update_for_aspect_ratio()
	}

	private _update_for_aspect_ratio(){

		if(this._aspect){
			let lock_width = this._param_lock_width
			if(lock_width == null){ lock_width = true }

			this._object.aspect = this._aspect
			if(lock_width){
				const other_fov = this._param_fov / this._aspect
				this._object.zoom = this.get_zoom(
					this._aspect,
					other_fov,
					this._param_vertical_fov_range
				)
			} else {
				this._object.zoom = 1
			}

			this._object.updateProjectionMatrix();
		}
	}
	private get_zoom(start_zoom: number, other_fov: number, range: THREE.Vector2){
		let zoom = start_zoom
		if(range){
			if(
				other_fov < range.x ||
				other_fov > range.y
			){
				const new_other_fov = lodash_clamp(other_fov, range.x, range.y)
				zoom = start_zoom * (other_fov / new_other_fov)
				// zoom = Math.min(start_zoom, zoom)
			}
		}
		return zoom
	}

	private update_screen_quad(){
		const quad = this.screen_quad()

		for(let corner_name of CORNER_NAMES){
			this._update_corner_vector(this._bg_corner[corner_name], SCREEN_COORD[corner_name])
		}
		let width = this._bg_corner.bl.distanceTo(this._bg_corner.br)
		let height = this._bg_corner.bl.distanceTo(this._bg_corner.tl)

		this._bg_center.x = lodash_sum( CORNER_NAMES.map(name => this._bg_corner[name].x ) ) / 4
		this._bg_center.y = lodash_sum( CORNER_NAMES.map(name => this._bg_corner[name].y ) ) / 4
		this._bg_center.z = lodash_sum( CORNER_NAMES.map(name => this._bg_corner[name].z ) ) / 4

		if( this.self._param_far && !lodash_isNaN(width) && !lodash_isNaN(height) ){
			const z = this._bg_center.distanceTo(this.self._object.position)
			const z_ratio = this.self._param_far / z
			const desired_ratio = this._param_background_ratio || 1

			if(width > height){
				height = width / desired_ratio
			} else {
				height = width * desired_ratio
			}

			quad.scale.x = width * z_ratio;
			quad.scale.y = height * z_ratio;
			quad.position.z = - 0.9999 * this.self._param_far //.copy(this._bg_center)
		}
	}

};


