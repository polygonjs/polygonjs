import {NodeParamsConfig} from "../../utils/params/ParamsConfig";
import {TypedObjNode} from "../_Base";
import {TransformController as TransformController2} from "./TransformController";
class HierarchyParamsConfig extends NodeParamsConfig {
}
export class HierarchyObjNode extends TypedObjNode {
  constructor() {
    super(...arguments);
    this.hierarchy_controller = new HierarchyController(this);
  }
}
export class HierarchyController {
  constructor(node) {
    this.node = node;
  }
  initialize_node() {
    this.node.io.inputs.set_count(0, 1);
    this.node.io.inputs.set_depends_on_inputs(false);
    this.node.io.outputs.set_has_one_output();
    this.node.io.inputs.add_on_set_input_hook("on_input_updated:update_parent", () => {
      this.on_input_updated();
    });
  }
  static on_input_updated(node) {
    const parent_object = node.root.get_parent_for_node(node);
    if (node.transform_controller && parent_object) {
      TransformController2.update_node_transform_params_if_required(node, parent_object);
    }
    if (node.io.inputs.input(0) != null) {
      node.root.add_to_parent_transform(node);
    } else {
      node.root.remove_from_parent_transform(node);
    }
  }
  on_input_updated() {
    HierarchyController.on_input_updated(this.node);
  }
}
