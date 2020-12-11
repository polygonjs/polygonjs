import {CoreMapboxTransform} from "../../../core/mapbox/Transform";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {MapboxListenerParamConfig, MapboxListenerSopNode} from "./utils/mapbox/MapboxListener";
const INPUT_NAMES = ["points to transform in mapbox space"];
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class MapboxTransformSopParamsConfig extends MapboxListenerParamConfig(NodeParamsConfig) {
}
const ParamsConfig2 = new MapboxTransformSopParamsConfig();
export class MapboxTransformSopNode extends MapboxListenerSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "mapbox_transform";
  }
  static displayed_input_names() {
    return INPUT_NAMES;
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  cook(input_contents) {
    if (!this._camera_node) {
      this.update_mapbox_camera();
      if (!this._camera_node) {
        this.states.error.set("mapbox camera not found");
        return;
      }
    }
    const core_group = input_contents[0];
    this.transform_input(core_group);
  }
  transform_input(core_group) {
    if (this._camera_node) {
      const transformer = new CoreMapboxTransform(this._camera_node);
      for (let object of core_group.objects()) {
        transformer.transform_group_FINAL(object);
      }
    } else {
      this.states.error.set("no camera node found");
    }
    this.set_core_group(core_group);
  }
  _post_init_controller() {
  }
}
