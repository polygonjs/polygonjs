import {CameraController as CameraController2} from "../../../../../core/CameraController";
import {NodeContext as NodeContext2} from "../../../../poly/NodeContext";
import {MapboxCameraObjNode} from "../../../obj/MapboxCamera";
import {TypedSopNode} from "../../_Base";
import {NodeParamsConfig, ParamConfig} from "../../../utils/params/ParamsConfig";
export function MapboxListenerParamConfig(Base3) {
  return class Mixin extends Base3 {
    constructor() {
      super(...arguments);
      this.use_bounds = ParamConfig.BOOLEAN(0, {hidden: true});
      this.south_west = ParamConfig.VECTOR2([-0.11, 51.51], {
        visible_if: {use_bounds: 1}
      });
      this.north_east = ParamConfig.VECTOR2([-0.1, 51.52], {
        visible_if: {use_bounds: 1}
      });
      this.use_zoom = ParamConfig.BOOLEAN(0, {hidden: true});
      this.zoom = ParamConfig.FLOAT(0, {
        visible_if: {use_zoom: 1}
      });
      this.mapbox_camera = ParamConfig.OPERATOR_PATH("/mapbox_camera1", {
        node_selection: {
          context: NodeContext2.OBJ,
          types: [MapboxCameraObjNode.type()]
        },
        callback: (node) => {
          MapboxListenerSopNode.PARAM_CALLBACK_update_mapbox_camera(node);
        }
      });
      this.zoom_range = ParamConfig.VECTOR2([0, 24]);
      this.update_always_allowed = ParamConfig.BOOLEAN(0, {hidden: true});
      this.update_always = ParamConfig.BOOLEAN(0, {
        visible_if: {update_always_allowed: 1}
      });
    }
  };
}
class MapboxListenerParamsConfig extends MapboxListenerParamConfig(NodeParamsConfig) {
}
export class MapboxListenerSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this._mapbox_listener = new MapboxListener(this);
  }
  static PARAM_CALLBACK_update_mapbox_camera(node) {
    node.update_mapbox_camera();
  }
  update_mapbox_camera() {
    this._camera_node = this.find_camera_node();
  }
  get camera_node() {
    return this._camera_node;
  }
  get camera_object() {
    return this._camera_node?.object;
  }
  find_camera_node() {
    const node = this.p.mapbox_camera.found_node_with_context(NodeContext2.OBJ);
    if (node) {
      if (node.type == MapboxCameraObjNode.type()) {
        return node;
      } else {
        this.states.error.set("found node is not a mapbox camera");
      }
    }
  }
}
class MapboxListenerSopNodeWithParams extends MapboxListenerSopNode {
  constructor() {
    super(...arguments);
    this.params_config = new MapboxListenerParamsConfig();
  }
  _post_init_controller() {
  }
}
export class MapboxListener {
  constructor(_node) {
    this._node = _node;
    this._camera_controller = new CameraController2(this._update_from_camera.bind(this));
  }
  async cook() {
    if (!this._node.camera_node) {
      this._node.update_mapbox_camera();
      this._update_camera_controller();
    }
    if (!this._node.camera_node) {
      this._node.set_objects([]);
      return;
    }
    let zoom = this._node.camera_node.zoom();
    const is_mapbox_active = this._node.camera_node != null;
    const is_zoom_in_range = zoom != null && zoom > this._node.pv.zoom_range.x && zoom < this._node.pv.zoom_range.y;
    const do_post_init_controller = !is_mapbox_active || is_zoom_in_range;
    if (do_post_init_controller) {
      this._node._post_init_controller();
    } else {
      this._node.set_objects([]);
    }
  }
  _update_camera_controller() {
    this._camera_controller.set_update_always(this._node.pv.update_always || false);
    if (this._current_camera_path == null || this._current_camera_path !== this._node.pv.camera) {
      if (this._node.camera_object) {
        this._camera_controller.set_target(this._node.camera_object);
      } else {
        this._camera_controller.remove_target();
      }
      this._current_camera_path = this._node.pv.mapbox_camera;
    }
  }
  _update_from_camera() {
    if (this._node.cook_controller.is_cooking) {
      setTimeout(this._update_from_camera.bind(this), 1e3);
    } else {
      const has_zoom_param = this._node.pv.use_zoom;
      const has_bounds_params = this._node.pv.use_bounds;
      const cooker = this._node.scene.cooker;
      if (has_bounds_params || has_zoom_param) {
        cooker.block();
      }
      const camera_node = this._node.camera_node;
      if (has_bounds_params) {
        const sw_param = this._node.p.south_west;
        const ne_param = this._node.p.north_east;
        if (camera_node) {
          const bounds = camera_node.bounds();
          if (camera_node != null && bounds != null) {
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            sw_param.set([sw.lng, sw.lat]);
            ne_param.set([ne.lng, ne.lat]);
          }
        }
      }
      if (has_zoom_param) {
        if (camera_node) {
          const zoom = camera_node.zoom();
          if (zoom) {
            this._node.p.zoom.set(zoom);
          }
        }
      }
      if (has_bounds_params || has_zoom_param) {
        cooker.unblock();
      }
      if (!has_bounds_params && !has_zoom_param) {
        this._node.set_dirty();
      }
    }
  }
}
