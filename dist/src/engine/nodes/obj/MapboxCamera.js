import {PerspectiveCamera as PerspectiveCamera2} from "three/src/cameras/PerspectiveCamera";
import {TypedCameraObjNode, CameraMasterCameraParamConfig} from "./_BaseCamera";
import mapboxgl from "mapbox-gl";
import {MapboxViewer} from "../../viewers/Mapbox";
import {CoreMapboxClient} from "../../../core/mapbox/Client";
import {ParamConfig, NodeParamsConfig} from "..//utils/params/ParamsConfig";
import {CameraNodeType} from "../../poly/NodeContext";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
class MapboxCameraObjParamConfig extends CameraMasterCameraParamConfig(NodeParamsConfig) {
  constructor() {
    super(...arguments);
    this.style = ParamConfig.STRING("mapbox://styles/mapbox/dark-v10", {
      callback: (node) => {
        MapboxCameraObjNode.PARAM_CALLBACK_update_style(node);
      }
    });
    this.lng_lat = ParamConfig.VECTOR2([-0.07956, 51.5146], {
      callback: (node) => {
        MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node);
      }
    });
    this.zoom = ParamConfig.FLOAT(15.55, {
      range: [0, 24],
      range_locked: [true, true],
      callback: (node) => {
        MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node);
      }
    });
    this.zoom_range = ParamConfig.VECTOR2([0, 24], {
      callback: (node) => {
        MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node);
      }
    });
    this.pitch = ParamConfig.FLOAT(60, {
      range: [0, 60],
      range_locked: [true, true],
      callback: (node) => {
        MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node);
      }
    });
    this.bearing = ParamConfig.FLOAT(60.373613, {
      range: [0, 360],
      callback: (node) => {
        MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node);
      }
    });
    this.update_params_from_map = ParamConfig.BUTTON(null, {
      label: "Set Navigation Params as Default",
      callback: (node, param) => {
        MapboxCameraObjNode.PARAM_CALLBACK_update_params_from_map(node);
      }
    });
    this.allow_drag_rotate = ParamConfig.BOOLEAN(1, {
      callback: (node) => {
        MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node);
      }
    });
    this.add_zoom_control = ParamConfig.BOOLEAN(1, {
      callback: (node) => {
        MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node);
      }
    });
  }
}
const ParamsConfig2 = new MapboxCameraObjParamConfig();
export class MapboxCameraObjNode extends TypedCameraObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._maps_by_container_id = new Map();
    this._map_containers_by_container_id = new Map();
    this._canvases_by_container_id = new Map();
    this._controls_by_container_id = new Map();
    this._moving_maps = false;
    this._inverse_proj_mat = new Matrix42();
    this._cam_pos = new Vector32();
    this._mouse_pos = new Vector32();
    this._view_dir = new Vector32();
  }
  static type() {
    return CameraNodeType.MAPBOX;
  }
  integration_data() {
    return CoreMapboxClient.integration_data();
  }
  create_object() {
    return new PerspectiveCamera2();
  }
  async cook() {
    this.update_maps();
    this.cook_controller.end_cook();
  }
  prepare_raycaster(mouse, raycaster) {
    this._inverse_proj_mat.copy(this._object.projectionMatrix);
    this._inverse_proj_mat.invert();
    this._cam_pos.set(0, 0, 0);
    this._cam_pos.applyMatrix4(this._inverse_proj_mat);
    this._mouse_pos.set(mouse.x, mouse.y, 1);
    this._mouse_pos.applyMatrix4(this._inverse_proj_mat);
    this._view_dir.copy(this._mouse_pos).sub(this._cam_pos).normalize();
    raycaster.set(this._cam_pos, this._view_dir);
  }
  create_map(container) {
    CoreMapboxClient.ensure_token_is_set();
    const map = new mapboxgl.Map({
      style: this.pv.style,
      container,
      center: this.pv.lng_lat.toArray(),
      zoom: this.pv.zoom,
      minZoom: this.pv.zoom_range.x,
      maxZoom: this.pv.zoom_range.y,
      pitch: this.pv.pitch,
      bearing: this.pv.bearing,
      preserveDrawingBuffer: true,
      dragRotate: this.pv.allow_drag_rotate,
      pitchWithRotate: this.pv.allow_drag_rotate
    });
    this._add_remove_controls(map, container.id);
    this._maps_by_container_id.set(container.id, map);
    this._map_containers_by_container_id.set(container.id, container);
    this._canvases_by_container_id.set(container.id, container.querySelector("canvas"));
    return map;
  }
  update_maps() {
    this._maps_by_container_id.forEach((map, container_id) => {
      this.update_map_from_container_id(container_id);
    });
  }
  update_map_from_container_id(container_id) {
    const map = this._maps_by_container_id.get(container_id);
    if (!map) {
      return;
    }
    this.update_map_nav(map);
    this._add_remove_controls(map, container_id);
    map.setStyle(this.pv.style);
  }
  update_map_nav(map) {
    map.jumpTo(this.camera_options_from_params());
    map.setMinZoom(this.pv.zoom_range.x);
    map.setMaxZoom(this.pv.zoom_range.y);
    const drag_rotate_handler = map.dragRotate;
    if (this.pv.allow_drag_rotate) {
      drag_rotate_handler.enable();
    } else {
      drag_rotate_handler.disable();
    }
  }
  first_map() {
    let first_map;
    this._maps_by_container_id.forEach((map, id) => {
      if (!first_map) {
        first_map = map;
      }
    });
    return first_map;
  }
  first_id() {
    let first_id;
    this._maps_by_container_id.forEach((map, id) => {
      if (!first_id) {
        first_id = id;
      }
    });
    return first_id;
  }
  first_map_element() {
    const id = this.first_id();
    if (id) {
      return this._map_containers_by_container_id.get(id);
    }
  }
  bounds() {
    const map = this.first_map();
    if (map) {
      return map.getBounds();
    }
  }
  zoom() {
    const map = this.first_map();
    if (map) {
      return map.getZoom();
    }
  }
  center() {
    const map = this.first_map();
    if (map) {
      return map.getCenter();
    }
  }
  horizontal_lng_lat_points() {
    const id = this.first_id();
    if (id) {
      const map = this._maps_by_container_id.get(id);
      const element = this._canvases_by_container_id.get(id);
      if (map && element) {
        const y = element.clientHeight / 2;
        return [map.unproject([0, y]), map.unproject([100, y])];
      }
    }
  }
  center_lng_lat_point() {
    const id = this.first_id();
    if (id) {
      const map = this._maps_by_container_id.get(id);
      const element = this._canvases_by_container_id.get(id);
      if (map && element) {
        const x = element.clientWidth * 0.5;
        const y = element.clientHeight * 0.5;
        return map.unproject([x, y]);
      }
    }
  }
  vertical_far_lng_lat_points() {
    const id = this.first_id();
    if (id) {
      const map = this._maps_by_container_id.get(id);
      const element = this._canvases_by_container_id.get(id);
      if (map && element) {
        const x = element.clientWidth;
        const y = 0;
        return [map.unproject([0, y]), map.unproject([x, y])];
      }
    }
  }
  vertical_near_lng_lat_points() {
    const id = this.first_id();
    if (id) {
      const map = this._maps_by_container_id.get(id);
      const element = this._canvases_by_container_id.get(id);
      if (map && element) {
        const x = element.clientWidth;
        const y = element.clientHeight;
        return [map.unproject([0, y]), map.unproject([x, y])];
      }
    }
  }
  remove_map(container) {
    if (container) {
      const map = this._maps_by_container_id.get(container.id);
      if (map) {
        map.remove();
        this._maps_by_container_id.delete(container.id);
        this._map_containers_by_container_id.delete(container.id);
        this._canvases_by_container_id.delete(container.id);
        this._controls_by_container_id.delete(container.id);
      }
    }
  }
  on_move_end(container) {
    if (this._moving_maps === true) {
      return;
    }
    this._moving_maps = true;
    if (container != null) {
      const triggering_map = this._maps_by_container_id.get(container.id);
      if (triggering_map != null) {
        const camera_options = this.camera_options_from_map(triggering_map);
        this._maps_by_container_id.forEach((map, container_id) => {
          if (container_id !== container.id) {
            const map2 = this._maps_by_container_id.get(container_id);
            map2?.jumpTo(camera_options);
          }
        });
      }
    }
    this.object.dispatchEvent({type: "moveend"});
    this._moving_maps = false;
  }
  lng_lat() {
    const val = this.pv.lng_lat;
    return {
      lng: val.x,
      lat: val.y
    };
  }
  camera_options_from_params() {
    return {
      center: this.lng_lat(),
      pitch: this.pv.pitch,
      bearing: this.pv.bearing,
      zoom: this.pv.zoom
    };
  }
  camera_options_from_map(map) {
    return {
      center: map.getCenter(),
      pitch: map.getPitch(),
      bearing: map.getBearing(),
      zoom: map.getZoom()
    };
  }
  _add_remove_controls(map, container_id) {
    let nav_control = this._controls_by_container_id.get(container_id);
    if (nav_control) {
      if (!this.pv.add_zoom_control) {
        map.removeControl(nav_control);
        this._controls_by_container_id.delete(container_id);
      }
    } else {
      if (this.pv.add_zoom_control) {
        nav_control = new mapboxgl.NavigationControl();
        map.addControl(nav_control, "bottom-right");
        this._controls_by_container_id.set(container_id, nav_control);
      }
    }
  }
  update_params_from_map() {
    const map = this.first_map();
    if (map) {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const pitch = map.getPitch();
      const bearing = map.getBearing();
      this.p.lng_lat.set([center.lng, center.lat]);
      this.p.zoom.set(zoom);
      this.p.pitch.set(pitch);
      this.p.bearing.set(bearing);
    }
  }
  static PARAM_CALLBACK_update_params_from_map(node) {
    node.update_params_from_map();
  }
  static PARAM_CALLBACK_update_style(node) {
    node.update_style();
  }
  static PARAM_CALLBACK_update_nav(node) {
    node.update_nav();
  }
  update_style() {
    this._maps_by_container_id.forEach((map, container_id) => {
      map.setStyle(this.pv.style);
    });
  }
  update_nav() {
    this._maps_by_container_id.forEach((map) => {
      this.update_map_nav(map);
    });
  }
  create_viewer(element) {
    return new MapboxViewer(element, this.scene, this);
  }
}
