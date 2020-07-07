export class SceneLibsController {
	private _root: string | null = '/three/js/libs';

	root() {
		return this._root;
	}
	set_root(url: string | null) {
		if (url == '') {
			url = null;
		}
		this._root = url;
	}
}
