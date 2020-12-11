import {TypedEventNode} from "./_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {RaycastCPUController, CPU_INTERSECT_WITH_OPTIONS, CPUIntersectWith} from "./utils/raycast/CPUController";
import {RaycastGPUController} from "./utils/raycast/GPUController";
import {AttribType, ATTRIBUTE_TYPES, AttribTypeMenuEntries} from "../../../core/geometry/Constant";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
import {ParamType as ParamType2} from "../../poly/ParamType";
const TIMESTAMP = 1e3 / 60;
var RaycastMode;
(function(RaycastMode2) {
  RaycastMode2["CPU"] = "cpu";
  RaycastMode2["GPU"] = "gpu";
})(RaycastMode || (RaycastMode = {}));
const RAYCAST_MODES = [RaycastMode.CPU, RaycastMode.GPU];
function visible_for_cpu(options = {}) {
  options["mode"] = RAYCAST_MODES.indexOf(RaycastMode.CPU);
  return {visible_if: options};
}
function visible_for_cpu_geometry(options = {}) {
  options["mode"] = RAYCAST_MODES.indexOf(RaycastMode.CPU);
  options["intersect_with"] = CPU_INTERSECT_WITH_OPTIONS.indexOf(CPUIntersectWith.GEOMETRY);
  return {visible_if: options};
}
function visible_for_cpu_plane(options = {}) {
  options["mode"] = RAYCAST_MODES.indexOf(RaycastMode.CPU);
  options["intersect_with"] = CPU_INTERSECT_WITH_OPTIONS.indexOf(CPUIntersectWith.PLANE);
  return {visible_if: options};
}
function visible_for_gpu(options = {}) {
  options["mode"] = RAYCAST_MODES.indexOf(RaycastMode.GPU);
  return {visible_if: options};
}
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class RaycastParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.mode = ParamConfig.INTEGER(RAYCAST_MODES.indexOf(RaycastMode.CPU), {
      menu: {
        entries: RAYCAST_MODES.map((name, value) => {
          return {
            name,
            value
          };
        })
      }
    });
    this.mouse = ParamConfig.VECTOR2([0, 0], {cook: false});
    this.override_camera = ParamConfig.BOOLEAN(0);
    this.override_ray = ParamConfig.BOOLEAN(0, {
      visible_if: {
        mode: RAYCAST_MODES.indexOf(RaycastMode.CPU),
        override_camera: 1
      }
    });
    this.camera = ParamConfig.OPERATOR_PATH("/perspective_camera1", {
      node_selection: {
        context: NodeContext2.OBJ
      },
      dependent_on_found_node: false,
      visible_if: {
        override_camera: 1,
        override_ray: 0
      }
    });
    this.ray_origin = ParamConfig.VECTOR3([0, 0, 0], {
      visible_if: {
        override_camera: 1,
        override_ray: 1
      }
    });
    this.ray_direction = ParamConfig.VECTOR3([0, 0, 1], {
      visible_if: {
        override_camera: 1,
        override_ray: 1
      }
    });
    this.material = ParamConfig.OPERATOR_PATH("/MAT/mesh_basic_builder1", {
      node_selection: {
        context: NodeContext2.MAT
      },
      dependent_on_found_node: false,
      callback: (node, param) => {
        RaycastGPUController.PARAM_CALLBACK_update_material(node);
      },
      ...visible_for_gpu()
    });
    this.pixel_value = ParamConfig.VECTOR4([0, 0, 0, 0], {
      cook: false,
      ...visible_for_gpu()
    });
    this.hit_threshold = ParamConfig.FLOAT(0.5, {
      cook: false,
      ...visible_for_gpu()
    });
    this.intersect_with = ParamConfig.INTEGER(CPU_INTERSECT_WITH_OPTIONS.indexOf(CPUIntersectWith.GEOMETRY), {
      menu: {
        entries: CPU_INTERSECT_WITH_OPTIONS.map((name, value) => {
          return {name, value};
        })
      },
      ...visible_for_cpu()
    });
    this.points_threshold = ParamConfig.FLOAT(1, {
      range: [0, 100],
      range_locked: [true, false],
      ...visible_for_cpu()
    });
    this.plane_direction = ParamConfig.VECTOR3([0, 1, 0], {
      ...visible_for_cpu_plane()
    });
    this.plane_offset = ParamConfig.FLOAT(0, {
      ...visible_for_cpu_plane()
    });
    this.target = ParamConfig.OPERATOR_PATH("/geo1", {
      node_selection: {
        context: NodeContext2.OBJ
      },
      dependent_on_found_node: false,
      callback: (node, param) => {
        RaycastCPUController.PARAM_CALLBACK_update_target(node);
      },
      ...visible_for_cpu_geometry()
    });
    this.traverse_children = ParamConfig.BOOLEAN(0, {
      callback: (node, param) => {
        RaycastCPUController.PARAM_CALLBACK_update_target(node);
      },
      ...visible_for_cpu_geometry()
    });
    this.sep = ParamConfig.SEPARATOR(null, {
      ...visible_for_cpu_geometry()
    });
    this.tposition_target = ParamConfig.BOOLEAN(0, {
      cook: false,
      ...visible_for_cpu()
    });
    this.position = ParamConfig.VECTOR3([0, 0, 0], {
      cook: false,
      ...visible_for_cpu({tposition_target: 0})
    });
    this.position_target = ParamConfig.OPERATOR_PATH("", {
      cook: false,
      ...visible_for_cpu({tposition_target: 1}),
      param_selection: ParamType2.VECTOR3,
      compute_on_dirty: true
    });
    this.tvelocity = ParamConfig.BOOLEAN(0, {
      cook: false
    });
    this.tvelocity_target = ParamConfig.BOOLEAN(0, {
      cook: false,
      ...visible_for_cpu({tvelocity: 1})
    });
    this.velocity = ParamConfig.VECTOR3([0, 0, 0], {
      cook: false,
      ...visible_for_cpu({tvelocity: 1, tvelocity_target: 0})
    });
    this.velocity_target = ParamConfig.OPERATOR_PATH("", {
      cook: false,
      ...visible_for_cpu({tvelocity: 1, tvelocity_target: 1}),
      param_selection: ParamType2.VECTOR3,
      compute_on_dirty: true
    });
    this.geo_attribute = ParamConfig.BOOLEAN(0, visible_for_cpu_geometry());
    this.geo_attribute_name = ParamConfig.STRING("id", {
      cook: false,
      ...visible_for_cpu_geometry({geo_attribute: 1})
    });
    this.geo_attribute_type = ParamConfig.INTEGER(ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), {
      menu: {
        entries: AttribTypeMenuEntries
      },
      ...visible_for_cpu_geometry({geo_attribute: 1})
    });
    this.geo_attribute_value1 = ParamConfig.FLOAT(0, {
      cook: false,
      ...visible_for_cpu_geometry({
        geo_attribute: 1,
        geo_attribute_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC)
      })
    });
    this.geo_attribute_values = ParamConfig.STRING("", {
      ...visible_for_cpu_geometry({
        geo_attribute: 1,
        geo_attribute_type: ATTRIBUTE_TYPES.indexOf(AttribType.STRING)
      })
    });
  }
}
const ParamsConfig2 = new RaycastParamsConfig();
const RaycastEventNode2 = class extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.cpu_controller = new RaycastCPUController(this);
    this.gpu_controller = new RaycastGPUController(this);
    this._last_event_processed_at = performance.now();
  }
  static type() {
    return "raycast";
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint("trigger", EventConnectionPointType.BASE, this._process_trigger_event_throttled.bind(this)),
      new EventConnectionPoint("mouse", EventConnectionPointType.MOUSE, this._process_mouse_event.bind(this)),
      new EventConnectionPoint("trigger_vel_reset", EventConnectionPointType.BASE, this._process_trigger_vel_reset.bind(this))
    ]);
    this.io.outputs.set_named_output_connection_points([
      new EventConnectionPoint(RaycastEventNode2.OUTPUT_HIT, EventConnectionPointType.BASE),
      new EventConnectionPoint(RaycastEventNode2.OUTPUT_MISS, EventConnectionPointType.BASE)
    ]);
  }
  trigger_hit(context) {
    this.dispatch_event_to_output(RaycastEventNode2.OUTPUT_HIT, context);
  }
  trigger_miss(context) {
    this.dispatch_event_to_output(RaycastEventNode2.OUTPUT_MISS, context);
  }
  _process_mouse_event(context) {
    if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
      this.cpu_controller.update_mouse(context);
    } else {
      this.gpu_controller.update_mouse(context);
    }
  }
  _process_trigger_event_throttled(context) {
    const previous = this._last_event_processed_at;
    const now = performance.now();
    this._last_event_processed_at = now;
    const delta = now - previous;
    if (delta < TIMESTAMP) {
      setTimeout(() => {
        this._process_trigger_event(context);
      }, TIMESTAMP - delta);
    } else {
      this._process_trigger_event(context);
    }
  }
  _process_trigger_event(context) {
    if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
      this.cpu_controller.process_event(context);
    } else {
      this.gpu_controller.process_event(context);
    }
  }
  _process_trigger_vel_reset(context) {
    if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
      this.cpu_controller.velocity_controller.reset();
    }
  }
};
export let RaycastEventNode = RaycastEventNode2;
RaycastEventNode.OUTPUT_HIT = "hit";
RaycastEventNode.OUTPUT_MISS = "miss";
