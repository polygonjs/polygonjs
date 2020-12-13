import {TypedEventNode} from "./_Base";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
var CookMode;
(function(CookMode2) {
  CookMode2["ALL_TOGETHER"] = "all together";
  CookMode2["BATCH"] = "batch";
})(CookMode || (CookMode = {}));
const COOK_MODES = [CookMode.ALL_TOGETHER, CookMode.BATCH];
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {TypeAssert} from "../../poly/Assert";
class NodeCookEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.mask = ParamConfig.STRING("/geo*", {
      callback: (node) => {
        NodeCookEventNode.PARAM_CALLBACK_update_resolved_nodes(node);
      }
    });
    this.force = ParamConfig.BOOLEAN(0);
    this.cook_mode = ParamConfig.INTEGER(COOK_MODES.indexOf(CookMode.ALL_TOGETHER), {
      menu: {
        entries: COOK_MODES.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.batch_size = ParamConfig.INTEGER(1, {visible_if: {cook_mode: COOK_MODES.indexOf(CookMode.BATCH)}});
    this.sep = ParamConfig.SEPARATOR();
    this.update_resolve = ParamConfig.BUTTON(null, {
      callback: (node, param) => {
        NodeCookEventNode.PARAM_CALLBACK_update_resolve(node);
      }
    });
    this.print_resolve = ParamConfig.BUTTON(null, {
      callback: (node, param) => {
        NodeCookEventNode.PARAM_CALLBACK_print_resolve(node);
      }
    });
  }
}
const ParamsConfig2 = new NodeCookEventParamsConfig();
const NodeCookEventNode2 = class extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._resolved_nodes = [];
    this._dispatched_first_node_cooked = false;
    this._dispatched_all_nodes_cooked = false;
    this._cook_state_by_node_id = new Map();
    this._on_node_cook_complete_bound = this._on_node_cook_complete.bind(this);
  }
  static type() {
    return "node_cook";
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint(NodeCookEventNode2.INPUT_TRIGGER, EventConnectionPointType.BASE, this.process_event_trigger.bind(this))
    ]);
    this.io.outputs.set_named_output_connection_points([
      new EventConnectionPoint(NodeCookEventNode2.OUTPUT_FIRST_NODE, EventConnectionPointType.BASE),
      new EventConnectionPoint(NodeCookEventNode2.OUTPUT_EACH_NODE, EventConnectionPointType.BASE),
      new EventConnectionPoint(NodeCookEventNode2.OUTPUT_ALL_NODES, EventConnectionPointType.BASE)
    ]);
  }
  trigger() {
    this.process_event_trigger({});
  }
  cook() {
    this._update_resolved_nodes();
    this.cook_controller.end_cook();
  }
  process_event_trigger(event_context) {
    this._cook_nodes_with_mode();
  }
  _cook_nodes_with_mode() {
    this._update_resolved_nodes();
    const mode = COOK_MODES[this.pv.cook_mode];
    switch (mode) {
      case CookMode.ALL_TOGETHER:
        return this._cook_nodes_all_together();
      case CookMode.BATCH:
        return this._cook_nodes_batch();
    }
    TypeAssert.unreachable(mode);
  }
  _cook_nodes_all_together() {
    this._cook_nodes(this._resolved_nodes);
  }
  async _cook_nodes_batch() {
    const batch_size = this.pv.batch_size;
    const batches_count = Math.ceil(this._resolved_nodes.length / batch_size);
    for (let i = 0; i < batches_count; i++) {
      const start = i * batch_size;
      const end = (i + 1) * batch_size;
      const nodes_in_batch = this._resolved_nodes.slice(start, end);
      await this._cook_nodes(nodes_in_batch);
    }
  }
  async _cook_nodes(nodes) {
    const promises = [];
    for (let node of nodes) {
      promises.push(this._cook_node(node));
    }
    return await Promise.all(promises);
  }
  _cook_node(node) {
    if (this.pv.force) {
      node.set_dirty(this);
    }
    return node.request_container();
  }
  static PARAM_CALLBACK_update_resolved_nodes(node) {
    node._update_resolved_nodes();
  }
  _update_resolved_nodes() {
    this._reset();
    this._resolved_nodes = this.scene.nodes_controller.nodes_from_mask(this.pv.mask || "");
    for (let node of this._resolved_nodes) {
      node.cook_controller.add_on_cook_complete_hook(this, this._on_node_cook_complete_bound);
      this._cook_state_by_node_id.set(node.graph_node_id, false);
    }
  }
  _reset() {
    this._dispatched_first_node_cooked = false;
    this._cook_state_by_node_id.clear();
    for (let node of this._resolved_nodes) {
      node.cook_controller.remove_on_cook_complete_hook(this);
    }
    this._resolved_nodes = [];
  }
  _all_nodes_have_cooked() {
    for (let node of this._resolved_nodes) {
      const state = this._cook_state_by_node_id.get(node.graph_node_id);
      if (!state) {
        return false;
      }
    }
    return true;
  }
  _on_node_cook_complete(node) {
    const event_context = {value: {node}};
    if (!this._dispatched_first_node_cooked) {
      this._dispatched_first_node_cooked = true;
      this.dispatch_event_to_output(NodeCookEventNode2.OUTPUT_FIRST_NODE, event_context);
    }
    if (!this._cook_state_by_node_id.get(node.graph_node_id)) {
      this.dispatch_event_to_output(NodeCookEventNode2.OUTPUT_EACH_NODE, event_context);
    }
    this._cook_state_by_node_id.set(node.graph_node_id, true);
    if (!this._dispatched_all_nodes_cooked) {
      if (this._all_nodes_have_cooked()) {
        this._dispatched_all_nodes_cooked = true;
        this.dispatch_event_to_output(NodeCookEventNode2.OUTPUT_ALL_NODES, {});
      }
    }
  }
  static PARAM_CALLBACK_update_resolve(node) {
    node._update_resolved_nodes();
  }
  static PARAM_CALLBACK_print_resolve(node) {
    node.print_resolve();
  }
  print_resolve() {
    console.log(this._resolved_nodes);
  }
};
export let NodeCookEventNode = NodeCookEventNode2;
NodeCookEventNode.INPUT_TRIGGER = "trigger";
NodeCookEventNode.OUTPUT_FIRST_NODE = "first";
NodeCookEventNode.OUTPUT_EACH_NODE = "each";
NodeCookEventNode.OUTPUT_ALL_NODES = "all";
