export class PolyLibsController {
	private _root: string | null = '/three/js/libs';

	root() {
		return this._root;
	}
	setRoot(url: string | null) {
		this._root = url;
	}
	//
	//
	// BASIS
	//
	//
	private _BASISPath: string | null = '/basis';
	// setBASISPath(path: string | null) {
	// 	this._BASISPath = path;
	// }
	BASISPath() {
		return this._BASISPath;
	}
	//
	//
	// DRACO
	//
	//
	private _DRACOPath: string | null = '/draco';
	// setDRACOPath(path: string | null) {
	// 	this._DRACOPath = path;
	// }
	DRACOPath() {
		return this._DRACOPath;
	}
	//
	//
	// DRACO GLTF
	//
	//
	private _DRACOGLTFPath: string | null = '/draco/gltf';
	// setDRACOGLTFPath(path: string | null) {
	// 	this._DRACOGLTFPath = path;
	// }
	DRACOGLTFPath() {
		return this._DRACOGLTFPath;
	}
}
