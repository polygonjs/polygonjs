import {Poly} from '../../Poly';

// import {PolyScene} from '../PolyScene';

export class SceneWebGLController {
	constructor() {}

	_require_webgl2: boolean = false;

	require_webgl2() {
		return this._require_webgl2;
	}
	set_require_webgl2() {
		if (!this._require_webgl2) {
			this._require_webgl2 = true;
			Poly.renderersController.setRequireWebGL2();
		}
	}
}
