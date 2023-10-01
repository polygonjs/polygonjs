import {Poly} from '../../Poly';

// import {PolyScene} from '../PolyScene';

export class SceneWebGLController {
	constructor() {}

	_requireWebGL2: boolean = false;

	requireWebGL2() {
		return this._requireWebGL2;
	}
	setRequireWebGL2() {
		if (!this._requireWebGL2) {
			this._requireWebGL2 = true;
			Poly.renderersController.setRequireWebGL2();
		}
	}
}
