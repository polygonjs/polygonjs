export class SceneLibsController {
  constructor() {
    this._root = "/three/js/libs";
  }
  root() {
    return this._root;
  }
  set_root(url) {
    if (url == "") {
      url = null;
    }
    this._root = url;
  }
}
