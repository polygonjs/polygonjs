import {TypedEventNode} from "./_Base";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
import {CameraNodeType, NodeContext as NodeContext2} from "../../poly/NodeContext";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import {Quaternion as Quaternion2} from "three/src/math/Quaternion";
import gsap from "gsap/gsap-core";
import {CoreObject} from "../../../core/geometry/Object";
import {AnimNodeEasing, InOutMode} from "../../../core/animation/Constant";
import {CameraOrbitControlsEventNode} from "./CameraOrbitControls";
import {CoreMath} from "../../../core/math/_Module";
var CameraNavigationBeaconsEventInput;
(function(CameraNavigationBeaconsEventInput2) {
  CameraNavigationBeaconsEventInput2["INIT"] = "init";
  CameraNavigationBeaconsEventInput2["TRIGGER"] = "trigger";
})(CameraNavigationBeaconsEventInput || (CameraNavigationBeaconsEventInput = {}));
var CameraNavigationBeaconsEventOutput;
(function(CameraNavigationBeaconsEventOutput2) {
  CameraNavigationBeaconsEventOutput2["AFTER_INIT"] = "after_init";
  CameraNavigationBeaconsEventOutput2["AFTER_ANIM"] = "after_anim";
})(CameraNavigationBeaconsEventOutput || (CameraNavigationBeaconsEventOutput = {}));
function init_cam_data() {
  return {
    t: new Vector32(),
    q: new Quaternion2(),
    s: new Vector32(),
    fov: 0,
    near: 0,
    far: 0,
    controls: {}
  };
}
const ATTRIB_NAME = {CAMERA: "camera"};
const EASING = `${AnimNodeEasing.POWER2}.${InOutMode.IN_OUT}`;
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {CoreSleep} from "../../../core/Sleep";
class CameraNavigationBeaconsEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.camera = ParamConfig.OPERATOR_PATH("/perspective_camera_MASTER", {
      node_selection: {
        context: NodeContext2.OBJ,
        types: [CameraNodeType.PERSPECTIVE]
      }
    });
    this.init = ParamConfig.BOOLEAN(0);
    this.init_camera = ParamConfig.OPERATOR_PATH("/perspective_camera_0", {
      node_selection: {
        context: NodeContext2.OBJ,
        types: [CameraNodeType.PERSPECTIVE]
      },
      visible_if: {init: 1}
    });
    this.duration = ParamConfig.FLOAT(2);
    this.rotation_delay = ParamConfig.FLOAT(1);
    this.projection_matrix_delay = ParamConfig.FLOAT(0);
    this.to_neares_pos = ParamConfig.BOOLEAN(0);
    this.hide_current_beacon = ParamConfig.BOOLEAN(1);
  }
}
const ParamsConfig2 = new CameraNavigationBeaconsEventParamsConfig();
export class CameraNavigationBeaconsEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._src_data = init_cam_data();
    this._dest_data = init_cam_data();
    this._prev_nav_beacons = [];
    this._current_nav_beacons = [];
    this._cam_proxy = {
      t: 0,
      q: 0,
      fov: 0
    };
    this._nav_beacon_proxy = {
      prev: {val: 0},
      current: {val: 0}
    };
    this._dest_delta = new Vector32();
    this._src_delta = new Vector32();
    this._dest_rot_m = new Matrix42();
    this._dest_rot_m_up = new Vector32(0, 1, 0);
  }
  static type() {
    return "camera_navigation_beacons";
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint(CameraNavigationBeaconsEventInput.INIT, EventConnectionPointType.BASE, this._process_init_event.bind(this)),
      new EventConnectionPoint(CameraNavigationBeaconsEventInput.TRIGGER, EventConnectionPointType.BASE, this._process_trigger_event.bind(this))
    ]);
    this.io.outputs.set_named_output_connection_points([
      new EventConnectionPoint(CameraNavigationBeaconsEventOutput.AFTER_INIT, EventConnectionPointType.BASE),
      new EventConnectionPoint(CameraNavigationBeaconsEventOutput.AFTER_ANIM, EventConnectionPointType.BASE)
    ]);
  }
  async _process_init_event(context) {
    if (!this.pv.init) {
      return;
    }
    const src_camera = this._get_src_camera();
    if (!src_camera) {
      return src_camera;
    }
    const target_camera = this._get_init_camera();
    if (!target_camera) {
      return;
    }
    CameraNavigationBeaconsEventNode._store_cam_data(target_camera, this._dest_data);
    await this._remove_current_camera_controls(src_camera);
    await CoreSleep.sleep(100);
    const src_camera_object = src_camera.camera();
    src_camera_object.position.copy(this._dest_data.t);
    src_camera_object.quaternion.copy(this._dest_data.q);
    src_camera_object.fov = this._dest_data.fov;
    src_camera_object.near = this._dest_data.near;
    src_camera_object.far = this._dest_data.far;
    src_camera_object.updateMatrix();
    src_camera_object.updateProjectionMatrix();
    if (this.pv.hide_current_beacon) {
      this._prev_nav_beacons = this._current_nav_beacons;
      this._current_nav_beacons = this._get_all_nav_beacon_objects(target_camera.name);
      for (let object of this._prev_nav_beacons) {
        object.scale.set(1, 1, 1);
        object.updateMatrix();
      }
      for (let object of this._current_nav_beacons) {
        object.scale.set(0, 0, 0);
        object.updateMatrix();
      }
    }
    await CoreSleep.sleep(100);
    await this._restore_camera_controls(src_camera, target_camera);
    this.dispatch_event_to_output(CameraNavigationBeaconsEventOutput.AFTER_INIT, context);
  }
  async _process_trigger_event(context) {
    const clicked_object = this._get_clicked_camera(context);
    if (!clicked_object) {
      return;
    }
    const camera_path = CoreObject.string_attrib_value(clicked_object, ATTRIB_NAME.CAMERA, 0);
    if (!camera_path) {
      return;
    }
    const target_camera = this.scene.node(camera_path);
    if (!target_camera) {
      console.warn(`no camera found with path ${camera_path}`);
      return;
    }
    const src_camera = this._get_src_camera();
    if (!src_camera) {
      return src_camera;
    }
    if (this.pv.hide_current_beacon) {
      this._prev_nav_beacons = this._current_nav_beacons;
      this._current_nav_beacons = this._get_all_nav_beacon_objects(camera_path);
    }
    CameraNavigationBeaconsEventNode._store_cam_data(src_camera, this._src_data);
    CameraNavigationBeaconsEventNode._store_cam_data(target_camera, this._dest_data);
    if (this.pv.to_neares_pos) {
      this._compute_neares_pos();
    }
    await this._start(src_camera, target_camera);
    this.dispatch_event_to_output(CameraNavigationBeaconsEventOutput.AFTER_ANIM, context);
  }
  async _start(src_camera, target_camera) {
    if (this.pv.hide_current_beacon) {
      this._animate_objects(this._current_nav_beacons, this._nav_beacon_proxy.current, 0);
    }
    await this._remove_current_camera_controls(src_camera);
    await this._animate_camera(src_camera);
    await this._restore_camera_controls(src_camera, target_camera);
    if (this.pv.hide_current_beacon) {
      this._animate_objects(this._prev_nav_beacons, this._nav_beacon_proxy.prev, 1);
    }
  }
  async _animate_objects(objects, proxy, target_scale) {
    const first_object = objects[0];
    if (!first_object) {
      return;
    }
    proxy.val = first_object.scale.x;
    gsap.to(proxy, {
      duration: 1,
      ease: EASING,
      val: target_scale,
      onUpdate: () => {
        for (let object of objects) {
          const s = proxy.val;
          object.scale.set(s, s, s);
          object.updateMatrix();
        }
      }
    });
  }
  async _animate_camera(src_camera) {
    const src_camera_object = src_camera.camera();
    this._cam_proxy.t = 0;
    this._cam_proxy.q = 0;
    this._cam_proxy.fov = 0;
    const duration = this.pv.duration;
    return new Promise((resolve) => {
      const timeline = gsap.timeline({
        onUpdate: () => {
          if (!src_camera_object.matrixAutoUpdate) {
            src_camera_object.updateMatrix();
          }
        },
        onComplete: resolve
      });
      timeline.to(this._cam_proxy, {
        duration,
        t: 1,
        ease: EASING,
        onUpdate: () => {
          src_camera_object.position.copy(this._src_data.t).lerp(this._dest_data.t, this._cam_proxy.t);
        }
      });
      timeline.to(this._cam_proxy, {
        duration,
        q: 1,
        ease: EASING,
        onUpdate: () => {
          src_camera_object.quaternion.copy(this._src_data.q).slerp(this._dest_data.q, this._cam_proxy.q);
        }
      }, this.pv.rotation_delay);
      timeline.to(this._cam_proxy, {
        duration,
        fov: 1,
        ease: EASING,
        onUpdate: () => {
          const blend = this._cam_proxy.fov;
          src_camera_object.fov = CoreMath.blend(this._src_data.fov, this._dest_data.fov, blend);
          src_camera_object.near = CoreMath.blend(this._src_data.near, this._dest_data.near, blend);
          src_camera_object.far = CoreMath.blend(this._src_data.far, this._dest_data.far, blend);
          src_camera_object.updateProjectionMatrix();
        }
      }, this.pv.projection_matrix_delay);
    });
  }
  _get_src_camera() {
    return this.p.camera.found_node_with_context_and_type(NodeContext2.OBJ, CameraNodeType.PERSPECTIVE);
  }
  _get_init_camera() {
    return this.p.init_camera.found_node_with_context_and_type(NodeContext2.OBJ, CameraNodeType.PERSPECTIVE);
  }
  _get_clicked_camera(context) {
    const value = context.value;
    if (!value) {
      return;
    }
    const intersect = value.intersect;
    if (!intersect) {
      return;
    }
    return intersect.object;
  }
  _get_all_nav_beacon_objects(camera_path_attrib_value) {
    const objects = [];
    this.scene.default_scene.traverse((child) => {
      const obj_camera_path = CoreObject.string_attrib_value(child, ATTRIB_NAME.CAMERA, 0);
      if (obj_camera_path && obj_camera_path == camera_path_attrib_value) {
        objects.push(child);
      }
    });
    return objects;
  }
  async _remove_current_camera_controls(camera_node) {
    camera_node.transform_controller.update_node_transform_params_from_object();
    camera_node.p.controls.set("");
  }
  async _restore_camera_controls(src_camera_node, target_camera_node) {
    this.scene.batch_update(() => {
      src_camera_node.transform_controller.update_node_transform_params_from_object();
      src_camera_node.p.fov.set(this._dest_data.fov);
      src_camera_node.p.near.set(this._dest_data.near);
      src_camera_node.p.far.set(this._dest_data.far);
      const node = this._dest_data.controls.node;
      if (node) {
        src_camera_node.p.controls.set(node.full_path());
      }
    });
  }
  static _store_cam_data(camera_node, data) {
    const camera_object = camera_node.camera();
    camera_object.updateMatrixWorld(false);
    camera_object.matrixWorld.decompose(data.t, data.q, data.s);
    data.fov = camera_object.fov;
    data.near = camera_object.near;
    data.far = camera_object.far;
    data.controls.node = camera_node.p.controls.found_node_with_context(NodeContext2.EVENT);
  }
  _compute_neares_pos() {
    const controls_node = this._dest_data.controls.node;
    if (!controls_node) {
      return;
    }
    if (!(controls_node instanceof CameraOrbitControlsEventNode)) {
      return;
    }
    const target = controls_node.pv.target;
    this._dest_delta.copy(this._dest_data.t).sub(target);
    const dest_delta_size = this._dest_delta.length();
    this._src_delta.copy(this._src_data.t).sub(target);
    this._src_delta.normalize().multiplyScalar(dest_delta_size);
    this._dest_data.t.copy(target).add(this._src_delta);
    this._dest_rot_m.identity();
    this._dest_rot_m.lookAt(this._dest_data.t, target, this._dest_rot_m_up);
    this._dest_data.q.setFromRotationMatrix(this._dest_rot_m);
  }
}
