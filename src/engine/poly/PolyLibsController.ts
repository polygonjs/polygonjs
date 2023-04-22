export class PolyLibsController {
	private _rootPrefix: string = '';
	private _root: string | null = '/three/js/libs';

	root() {
		if (this._root) {
			if (this._rootPrefix.length > 0) {
				// remove heading dots if any
				const root = this._root.replace(/^(\.)/, '');
				return `${this._rootPrefix}${root}`;
			} else {
				return this._root;
			}
		}
	}
	setRoot(url: string | null) {
		this._root = url;
	}
	setRootPrefix(prefix: string) {
		this._rootPrefix = prefix;
	}
	//
	//
	// KTX2
	//
	//
	private _KTX2Path: string | null = '/ktx2';
	KTX2Path() {
		return this._KTX2Path;
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
	//
	//
	// XATLAS
	//
	//
	private _XATLASPath: string | null = '/xatlas';
	// setDRACOGLTFPath(path: string | null) {
	// 	this._DRACOGLTFPath = path;
	// }
	XATLASPath() {
		return this._XATLASPath;
	}
	//
	//
	// OCCT
	//
	//
	private _OCCTPath: string | null = '/occt';
	OCCTPath() {
		return this._OCCTPath;
	}
	//
	//
	// MANIFOLD
	//
	//
	private _ManifoldPath: string | null = '/manifold';
	ManifoldPath() {
		return this._ManifoldPath;
	}
	//
	//
	// IFC
	//
	//
	private _WebIFCPath: string | null = '/web-ifc';
	webIFCPath() {
		return this._WebIFCPath;
	}
}
