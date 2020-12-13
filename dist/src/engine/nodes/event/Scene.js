import {ACCEPTED_SCENE_EVENT_TYPES} from "../../scene/utils/events/SceneEventsController";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from "./_BaseInput";
var SceneNodeInput;
(function(SceneNodeInput2) {
  SceneNodeInput2["SET_FRAME"] = "set_frame";
})(SceneNodeInput || (SceneNodeInput = {}));
var SceneNodeOutput;
(function(SceneNodeOutput2) {
  SceneNodeOutput2["TIME_REACHED"] = "time_reached";
})(SceneNodeOutput || (SceneNodeOutput = {}));
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {CoreGraphNode as CoreGraphNode2} from "../../../core/graph/CoreGraphNode";
class SceneEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.active = ParamConfig.BOOLEAN(true, {
      callback: (node, param) => {
        SceneEventNode.PARAM_CALLBACK_update_register(node);
      }
    });
    this.sep = ParamConfig.SEPARATOR(null, {visible_if: {active: true}});
    this.scene_loaded = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
    this.play = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
    this.pause = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
    this.tick = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
    this.sep0 = ParamConfig.SEPARATOR();
    this.treached_time = ParamConfig.BOOLEAN(0, {
      callback: (node) => {
        SceneEventNode.PARAM_CALLBACK_update_time_dependency(node);
      }
    });
    this.reached_time = ParamConfig.INTEGER(10, {
      visible_if: {treached_time: 1},
      range: [0, 100]
    });
    this.sep1 = ParamConfig.SEPARATOR();
    this.set_frame_value = ParamConfig.INTEGER(1, {
      range: [0, 100]
    });
    this.set_frame = ParamConfig.BUTTON(null, {
      callback: (node) => {
        SceneEventNode.PARAM_CALLBACK_set_frame(node);
      }
    });
  }
}
const ParamsConfig2 = new SceneEventParamsConfig();
export class SceneEventNode extends TypedInputEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "scene";
  }
  accepted_event_types() {
    return ACCEPTED_SCENE_EVENT_TYPES.map((n) => `${n}`);
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint(SceneNodeInput.SET_FRAME, EventConnectionPointType.BASE, this.on_set_frame.bind(this))
    ]);
    const out_connection_points = ACCEPTED_SCENE_EVENT_TYPES.map((event_type) => {
      return new EventConnectionPoint(event_type, EventConnectionPointType.BASE);
    });
    out_connection_points.push(new EventConnectionPoint(SceneNodeOutput.TIME_REACHED, EventConnectionPointType.BASE));
    this.io.outputs.set_named_output_connection_points(out_connection_points);
    this.params.on_params_created("update_time_dependency", () => {
      this.update_time_dependency();
    });
  }
  on_set_frame(event_context) {
    this.scene.set_frame(this.pv.set_frame_value);
  }
  on_frame_update() {
    if (this.scene.time >= this.pv.reached_time) {
      this.dispatch_event_to_output(SceneNodeOutput.TIME_REACHED, {});
    }
  }
  update_time_dependency() {
    if (this.pv.treached_time) {
      this.graph_node = this.graph_node || new CoreGraphNode2(this.scene, "scene_node_time_graph_node");
      this.graph_node.add_graph_input(this.scene.time_controller.graph_node);
      this.graph_node.add_post_dirty_hook("time_update", this.on_frame_update.bind(this));
    } else {
      if (this.graph_node) {
        this.graph_node.graph_disconnect_predecessors();
      }
    }
  }
  static PARAM_CALLBACK_set_frame(node) {
    node.on_set_frame({});
  }
  static PARAM_CALLBACK_update_time_dependency(node) {
    node.update_time_dependency();
  }
}
