import {TypedSopNode} from "./_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class ObjectMergeSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.geometry = ParamConfig.OPERATOR_PATH("", {
      node_selection: {
        context: NodeContext2.SOP
      }
    });
  }
}
const ParamsConfig2 = new ObjectMergeSopParamsConfig();
export class ObjectMergeSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "object_merge";
  }
  initialize_node() {
  }
  async cook(input_containers) {
    const geometry_node = this.p.geometry.found_node();
    if (geometry_node) {
      if (geometry_node.node_context() == NodeContext2.SOP) {
        const container = await geometry_node.request_container();
        this.import_input(geometry_node, container);
      } else {
        this.states.error.set("found node is not a geometry");
      }
    } else {
      this.states.error.set(`node not found at path '${this.pv.geometry}'`);
    }
  }
  import_input(geometry_node, container) {
    let core_group;
    if ((core_group = container.core_content_cloned()) != null) {
      this.set_core_group(core_group);
    } else {
      this.states.error.set("invalid target");
    }
  }
}
