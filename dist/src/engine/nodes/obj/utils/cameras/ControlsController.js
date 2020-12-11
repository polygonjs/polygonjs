import {UpdateFromControlsMode, UPDATE_FROM_CONTROLS_MODES} from "../../_BaseCamera";
import {CameraControlsConfig} from "../../../event/utils/CameraControlConfig";
import {TypeAssert} from "../../../../poly/Assert";
import {CAMERA_CONTROLS_NODE_TYPES, NodeContext as NodeContext2} from "../../../../poly/NodeContext";
const CONTROLS_PARAM_NAME = "controls";
export class ThreejsCameraControlsController {
  constructor(node) {
    this.node = node;
    this._applied_controls_by_element_id = new Map();
    this._controls_node = null;
  }
  controls_param() {
    if (this.node.params.has(CONTROLS_PARAM_NAME)) {
      return this.node.params.get(CONTROLS_PARAM_NAME);
    }
    return null;
  }
  async controls_node() {
    const controls_param = this.node.p.controls;
    const raw_input = controls_param.raw_input;
    if (raw_input && raw_input != "") {
      if (controls_param.is_dirty) {
        await controls_param.compute();
      }
      const node = controls_param.found_node_with_context(NodeContext2.EVENT);
      if (node) {
        if (CAMERA_CONTROLS_NODE_TYPES.includes(node.type)) {
          return node;
        } else {
          this.node.states.error.set("found node is not of a camera control type");
        }
      } else {
        this.node.states.error.set("no node has been found");
      }
    }
    return null;
  }
  async update_controls() {
    const controls_node = await this.controls_node();
    if (controls_node) {
      if (this._controls_node != controls_node) {
        this._dispose_control_refs();
      }
    }
    this._controls_node = controls_node;
  }
  async apply_controls(html_element) {
    const controls_node = await this.controls_node();
    if (controls_node) {
      const controls_id = controls_node.controls_id();
      let controls_aleady_applied = false;
      let map_for_element = this._applied_controls_by_element_id.get(html_element.id);
      if (map_for_element && map_for_element.get(controls_id)) {
        controls_aleady_applied = true;
      }
      if (!controls_aleady_applied) {
        map_for_element = new Map();
        this._applied_controls_by_element_id.set(html_element.id, map_for_element);
        map_for_element.set(controls_id, controls_node);
        const controls = await controls_node.apply_controls(this.node.object, html_element);
        const config = new CameraControlsConfig(this.node.graph_node_id, controls_node, controls);
        this.set_controls_events(controls);
        return config;
      }
    }
  }
  _dispose_control_refs() {
    this._applied_controls_by_element_id.forEach((map_for_element, element_id) => {
      this._dispose_controls_for_element_id(element_id);
    });
    this._applied_controls_by_element_id.clear();
  }
  _dispose_controls_for_element_id(html_element_id) {
    const map_for_element = this._applied_controls_by_element_id.get(html_element_id);
    if (map_for_element) {
      map_for_element.forEach((controls_node, controls_id) => {
        controls_node.dispose_controls_for_html_element_id(html_element_id);
      });
    }
    this._applied_controls_by_element_id.delete(html_element_id);
  }
  async dispose_controls(html_element) {
    this._dispose_controls_for_element_id(html_element.id);
  }
  set_controls_events(controls) {
    const update_mode = UPDATE_FROM_CONTROLS_MODES[this.node.pv.update_from_controls_mode];
    switch (update_mode) {
      case UpdateFromControlsMode.ON_END:
        return this._set_controls_events_to_update_on_end(controls);
      case UpdateFromControlsMode.ALWAYS:
        return this._set_controls_events_to_update_always(controls);
      case UpdateFromControlsMode.NEVER:
        return;
    }
    TypeAssert.unreachable(update_mode);
  }
  _set_controls_events_to_update_on_end(controls) {
    this.controls_end_listener = () => {
      this._update_camera_params();
    };
    controls.addEventListener("end", this.controls_end_listener);
  }
  _set_controls_events_to_update_always(controls) {
    this.controls_change_listener = () => {
      this._update_camera_params();
    };
    controls.addEventListener("change", this.controls_change_listener);
  }
  _update_camera_params() {
    if (this.node.pv.allow_update_from_controls) {
      this.node.update_transform_params_from_object();
    }
  }
}
