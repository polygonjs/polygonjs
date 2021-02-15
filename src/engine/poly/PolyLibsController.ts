export class PolyLibsController {
	private _root: string = '/three/js/libs';

	root() {
		return this._root;
	}
	setRoot(url: string) {
		this._root = url;
	}
}
