import {SubnetSopNodeLike} from "./utils/subnet/ChildrenDisplayController";
import {PolyNodeController as PolyNodeController2} from "../utils/poly/PolyNodeController";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
export function create_poly_sop_node(node_type, definition) {
  class PolySopParamsConfig extends NodeParamsConfig {
    constructor() {
      super(...arguments);
      this.template = ParamConfig.OPERATOR_PATH("../template");
      this.debug = ParamConfig.BUTTON(null, {
        callback: (node) => {
          BasePolySopNode2.PARAM_CALLBACK_debug(node);
        }
      });
    }
  }
  const ParamsConfig2 = new PolySopParamsConfig();
  class BasePolySopNode2 extends SubnetSopNodeLike {
    constructor() {
      super(...arguments);
      this.params_config = ParamsConfig2;
      this.poly_node_controller = new PolyNodeController2(this, definition);
    }
    static type() {
      return node_type;
    }
    static PARAM_CALLBACK_debug(node) {
      node._debug();
    }
    _debug() {
      this.poly_node_controller.debug(this.p.template);
    }
  }
  return BasePolySopNode2;
}
const BasePolySopNode = create_poly_sop_node("poly", {node_context: NodeContext2.SOP, inputs: [0, 4]});
export class PolySopNode extends BasePolySopNode {
}
