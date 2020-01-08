import {BaseBackgroundController} from './_BaseController';

import {Vector3} from 'three/src/math/Vector3';
import lodash_isNaN from 'lodash/isNaN';
import lodash_sum from 'lodash/sum';
// import { Vector2 } from 'three';

// enum CornerNames {
// 	bl = 'bl',
// 	br = 'br',
// 	tl = 'tl',
// 	tr = 'tr',
// }
interface Corners2D {
	bl: Vector2Components;
	br: Vector2Components;
	tl: Vector2Components;
	tr: Vector2Components;
}
interface Corners3D {
	bl: Vector3;
	br: Vector3;
	tl: Vector3;
	tr: Vector3;
}
const SCREEN_COORD: Corners2D = {
	bl: {x: -1, y: -1},
	br: {x: +1, y: -1},
	tl: {x: -1, y: +1},
	tr: {x: +1, y: +1},
};
const CORNER_NAMES: Array<keyof Corners3D> = ['bl', 'br', 'tl', 'tr'];

export class PerspectiveCameraBackgroundController extends BaseBackgroundController {
	private _bg_corner: Corners3D = {
		bl: new Vector3(),
		br: new Vector3(),
		tl: new Vector3(),
		tr: new Vector3(),
	};
	private _bg_center = new Vector3();

	protected update_screen_quad() {
		const quad = this.screen_quad;

		for (let corner_name of CORNER_NAMES) {
			this._update_corner_vector(this._bg_corner[corner_name], SCREEN_COORD[corner_name]);
		}
		let width = this._bg_corner.bl.distanceTo(this._bg_corner.br);
		let height = this._bg_corner.bl.distanceTo(this._bg_corner.tl);

		this._bg_center.x = lodash_sum(CORNER_NAMES.map((name) => this._bg_corner[name].x)) / 4;
		this._bg_center.y = lodash_sum(CORNER_NAMES.map((name) => this._bg_corner[name].y)) / 4;
		this._bg_center.z = lodash_sum(CORNER_NAMES.map((name) => this._bg_corner[name].z)) / 4;

		const far = this.node.params.float('far');
		const background_ratio = this.node.params.float('background_ratio');
		if (far && !lodash_isNaN(width) && !lodash_isNaN(height)) {
			const z = this._bg_center.distanceTo(this.node.object.position);
			const z_ratio = far / z;
			const desired_ratio = background_ratio || 1;

			if (width > height) {
				height = width / desired_ratio;
			} else {
				height = width * desired_ratio;
			}

			quad.scale.x = width * z_ratio;
			quad.scale.y = height * z_ratio;
			quad.position.z = -0.9999 * far; //.copy(this._bg_center)
		}
	}
	_update_corner_vector(vector: Vector3, coord: Vector2Components) {
		this._bg_raycaster.setFromCamera(coord, this.node.object);
		vector
			.copy(this._bg_raycaster.ray.direction)
			.multiplyScalar(this.node.params.float('far'))
			.add(this._bg_raycaster.ray.origin);
	}
}
