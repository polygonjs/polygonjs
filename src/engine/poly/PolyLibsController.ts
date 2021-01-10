export class PolyLibsController {
	private _root: string | null = '/three/js/libs';

	root() {
		return this._root;
	}
	setRoot(url: string | null) {
		if (url == '') {
			url = null;
		}
		this._root = url;
	}
}
