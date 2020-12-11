import {ObjectLoader as ObjectLoader2} from "three/src/loaders/ObjectLoader";
import {TypedSopNode} from "./_Base";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class CacheSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.cache = ParamConfig.STRING("", {hidden: true});
    this.reset = ParamConfig.BUTTON(null, {
      callback: (node, param) => {
        CacheSopNode.PARAM_CALLBACK_reset(node, param);
      }
    });
  }
}
const ParamsConfig2 = new CacheSopParamsConfig();
export class CacheSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "cache";
  }
  static displayed_input_names() {
    return ["geometry to cache"];
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
  }
  cook(input_contents) {
    const is_cache_empty = this.pv.cache == "" || this.pv.cache == null;
    const core_group = input_contents[0];
    if (is_cache_empty && core_group) {
      const json = [];
      for (let object of core_group.objects()) {
        json.push(object.toJSON());
      }
      this.set_core_group(core_group);
      this.p.cache.set(JSON.stringify(json));
    } else {
      if (this.pv.cache) {
        const obj_loader = new ObjectLoader2();
        const jsons = JSON.parse(this.pv.cache);
        const all_objects = [];
        for (let json of jsons) {
          const parent = obj_loader.parse(json);
          all_objects.push(parent);
        }
        this.set_objects(all_objects);
      } else {
        this.set_objects([]);
      }
    }
  }
  static PARAM_CALLBACK_reset(node, param) {
    node.param_callback_PARAM_CALLBACK_reset();
  }
  async param_callback_PARAM_CALLBACK_reset() {
    this.p.cache.set("");
    this.request_container();
  }
}
