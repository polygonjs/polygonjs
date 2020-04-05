// import {BaseBackgroundController} from './_BaseController';

// import lodash_isNaN from 'lodash/isNaN';

// export class OrthographicCameraBackgroundController extends BaseBackgroundController {
// 	protected update_screen_quad() {
// 		const quad = this.screen_quad;

// 		let width = this.node.params.float('size');
// 		let height = width;

// 		const far = this.node.params.float('far');
// 		if (far && !lodash_isNaN(width) && !lodash_isNaN(height)) {
// 			quad.scale.x = width;
// 			quad.scale.y = height;
// 			quad.position.z = -0.9999 * far; //.copy(this._bg_center)
// 		}
// 	}
// }
