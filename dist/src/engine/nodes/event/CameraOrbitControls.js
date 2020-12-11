import {TypedCameraControlsEventNode} from "./_BaseCameraControls";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
import {OrbitControls as OrbitControls2} from "../../../modules/core/controls/OrbitControls";
import {CameraControlsNodeType} from "../../poly/NodeContext";
const OUTPUT_START = "start";
const OUTPUT_CHANGE = "change";
const OUTPUT_END = "end";
var KeysMode;
(function(KeysMode2) {
  KeysMode2["PAN"] = "pan";
  KeysMode2["ROTATE"] = "rotate";
})(KeysMode || (KeysMode = {}));
const KEYS_MODES = [KeysMode.PAN, KeysMode.ROTATE];
class CameraOrbitEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.allow_pan = ParamConfig.BOOLEAN(1);
    this.allow_rotate = ParamConfig.BOOLEAN(1);
    this.allow_zoom = ParamConfig.BOOLEAN(1);
    this.tdamping = ParamConfig.BOOLEAN(1);
    this.damping = ParamConfig.FLOAT(0.1, {
      visible_if: {tdamping: true}
    });
    this.screen_space_panning = ParamConfig.BOOLEAN(1);
    this.rotate_speed = ParamConfig.FLOAT(0.5);
    this.min_distance = ParamConfig.FLOAT(1, {
      range: [0, 100],
      range_locked: [true, false]
    });
    this.max_distance = ParamConfig.FLOAT(50, {
      range: [0, 100],
      range_locked: [true, false]
    });
    this.limit_azimuth_angle = ParamConfig.BOOLEAN(0);
    this.azimuth_angle_range = ParamConfig.VECTOR2(["-2*$PI", "2*$PI"], {
      visible_if: {limit_azimuth_angle: 1}
    });
    this.polar_angle_range = ParamConfig.VECTOR2([0, "$PI"]);
    this.target = ParamConfig.VECTOR3([0, 0, 0], {
      cook: false,
      compute_on_dirty: true,
      callback: (node) => {
        CameraOrbitControlsEventNode.PARAM_CALLBACK_update_target(node);
      }
    });
    this.enable_keys = ParamConfig.BOOLEAN(0);
    this.keys_mode = ParamConfig.INTEGER(KEYS_MODES.indexOf(KeysMode.PAN), {
      visible_if: {enable_keys: 1},
      menu: {
        entries: KEYS_MODES.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.keys_pan_speed = ParamConfig.FLOAT(7, {
      range: [0, 10],
      range_locked: [false, false],
      visible_if: {enable_keys: 1, keys_mode: KEYS_MODES.indexOf(KeysMode.PAN)}
    });
    this.keys_rotate_speed_vertical = ParamConfig.FLOAT(1, {
      range: [0, 1],
      range_locked: [false, false],
      visible_if: {enable_keys: 1, keys_mode: KEYS_MODES.indexOf(KeysMode.ROTATE)}
    });
    this.keys_rotate_speed_horizontal = ParamConfig.FLOAT(1, {
      range: [0, 1],
      range_locked: [false, false],
      visible_if: {enable_keys: 1, keys_mode: KEYS_MODES.indexOf(KeysMode.ROTATE)}
    });
  }
}
const ParamsConfig2 = new CameraOrbitEventParamsConfig();
export class CameraOrbitControlsEventNode extends TypedCameraControlsEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._controls_by_element_id = new Map();
    this._target_array = [0, 0, 0];
  }
  static type() {
    return CameraControlsNodeType.ORBIT;
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points([
      new EventConnectionPoint(OUTPUT_START, EventConnectionPointType.BASE),
      new EventConnectionPoint(OUTPUT_CHANGE, EventConnectionPointType.BASE),
      new EventConnectionPoint(OUTPUT_END, EventConnectionPointType.BASE)
    ]);
  }
  async create_controls_instance(camera, element) {
    const controls = new OrbitControls2(camera, element);
    controls.addEventListener("end", () => {
      this._on_controls_end(controls);
    });
    this._controls_by_element_id.set(element.id, controls);
    this._bind_listeners_to_controls_instance(controls);
    return controls;
  }
  _bind_listeners_to_controls_instance(controls) {
    controls.addEventListener("start", () => {
      this.dispatch_event_to_output(OUTPUT_START, {});
    });
    controls.addEventListener("change", () => {
      this.dispatch_event_to_output(OUTPUT_CHANGE, {});
    });
    controls.addEventListener("end", () => {
      this.dispatch_event_to_output(OUTPUT_END, {});
    });
  }
  setup_controls(controls) {
    controls.enablePan = this.pv.allow_pan;
    controls.enableRotate = this.pv.allow_rotate;
    controls.enableZoom = this.pv.allow_zoom;
    controls.enableDamping = this.pv.tdamping;
    controls.dampingFactor = this.pv.damping;
    controls.rotateSpeed = this.pv.rotate_speed;
    controls.screenSpacePanning = this.pv.screen_space_panning;
    controls.minDistance = this.pv.min_distance;
    controls.maxDistance = this.pv.max_distance;
    this._set_azimuth_angle(controls);
    controls.minPolarAngle = this.pv.polar_angle_range.x;
    controls.maxPolarAngle = this.pv.polar_angle_range.y;
    controls.target.copy(this.pv.target);
    controls.update();
    controls.enableKeys = this.pv.enable_keys;
    if (controls.enableKeys) {
      controls.keyMode = KEYS_MODES[this.pv.keys_mode];
      controls.keyRotateSpeedVertical = this.pv.keys_rotate_speed_vertical;
      controls.keyRotateSpeedHorizontal = this.pv.keys_rotate_speed_horizontal;
      controls.keyPanSpeed = this.pv.keys_pan_speed;
    }
  }
  _set_azimuth_angle(controls) {
    if (this.pv.limit_azimuth_angle) {
      controls.minAzimuthAngle = this.pv.azimuth_angle_range.x;
      controls.maxAzimuthAngle = this.pv.azimuth_angle_range.y;
    } else {
      controls.minAzimuthAngle = Infinity;
      controls.minAzimuthAngle = Infinity;
    }
  }
  update_required() {
    return this.pv.tdamping;
  }
  _on_controls_end(controls) {
    if (!this.pv.allow_pan) {
      return;
    }
    controls.target.toArray(this._target_array);
    this.p.target.set(this._target_array);
  }
  static PARAM_CALLBACK_update_target(node) {
    node._update_target();
  }
  _update_target() {
    const src_target = this.pv.target;
    this._controls_by_element_id.forEach((control, element_id) => {
      const dest_target = control.target;
      if (!dest_target.equals(src_target)) {
        dest_target.copy(src_target);
        control.update();
      }
    });
  }
  dispose_controls_for_html_element_id(html_element_id) {
    const controls = this._controls_by_element_id.get(html_element_id);
    if (controls) {
      this._controls_by_element_id.delete(html_element_id);
    }
  }
}
