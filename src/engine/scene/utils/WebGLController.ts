// import {PolyScene} from 'src/engine/scene/PolyScene';

export class WebGLController {
	constructor() {}

	_require_webgl2: boolean = false;

	require_webgl2() {
		return this._require_webgl2;
	}
	set_require_webgl2() {
		if (!this._require_webgl2) {
			this._require_webgl2 = true;
			POLY.renderers_controller.set_require_webgl2();
		}
	}
}
