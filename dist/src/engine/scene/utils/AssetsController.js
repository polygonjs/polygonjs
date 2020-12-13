export class SceneAssetsController {
  constructor() {
    this._params_by_id = new Map();
    this._assets_root = null;
  }
  register_param(param) {
    this._params_by_id.set(param.graph_node_id, param);
  }
  deregister_param(param) {
    this._params_by_id.delete(param.graph_node_id);
  }
  traverse_params(callback) {
    this._params_by_id.forEach((param, id) => {
      callback(param);
    });
  }
  assets_root() {
    return this._assets_root;
  }
  set_assets_root(url) {
    if (url == "") {
      url = null;
    }
    this._assets_root = url;
  }
}
