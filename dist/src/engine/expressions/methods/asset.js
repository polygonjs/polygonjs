import {BaseMethod} from "./_Base";
const DEFAULT_RESOLVER = async (args) => {
  return args.asset_name;
};
const AssetExpression2 = class extends BaseMethod {
  static set_url_resolver(resolver) {
    this._resolver = resolver;
  }
  static required_arguments() {
    return [["string", "path"]];
  }
  async process_arguments(args) {
    const url = await this.request_asset_url(args[0]);
    return url;
  }
  find_dependency(index_or_path) {
    return null;
  }
  async request_asset_url(asset_name) {
    if (this.node) {
      const scene = this.node.scene;
      const scene_uuid = scene.uuid;
      const url = await AssetExpression2._resolver({
        asset_name,
        param: this.param,
        scene_uuid
      });
      return url;
    } else {
      return "ERROR: no node assigned";
    }
  }
};
export let AssetExpression = AssetExpression2;
AssetExpression._resolver = DEFAULT_RESOLVER;
