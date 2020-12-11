import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import {LinearInterpolant as LinearInterpolant2} from "three/src/math/interpolants/LinearInterpolant";
import {CoreGroup} from "../geometry/Group";
import {CoreGeometry} from "../geometry/Geometry";
import {CoreMapboxUtils} from "./Utils";
import mapboxgl from "mapbox-gl";
const Utils2 = CoreMapboxUtils;
const MAT_RX = new Matrix42().makeRotationAxis(new Vector32(1, 0, 0), -Math.PI / 2);
const POSITION_ATTRIB_NAME = "position";
const STEP_SIZE_BY_ZOOM = {
  1: 1.8022971652004332e6,
  2: 901148.582600187,
  3: 450574.29129994207,
  4: 225287.14564998331,
  5: 112643.57282498456,
  6: 56321.78641249478,
  7: 28160.89320639847,
  8: 14080.446603198769,
  9: 7040.223301600898,
  10: 3520.1116506467515,
  11: 1760.0558254750213,
  12: 880.027912584861,
  13: 440.01395644506556,
  14: 220.00697807141114,
  15: 110.00348918733653,
  16: 55.0017445946869,
  17: 27.50087214470841,
  18: 13.750436073372839,
  19: 6.8752180371957365,
  20: 3.437609169195639,
  21: 1.7188044319627807,
  22: 0.8594022154866252,
  23: 0.42970126142608933
};
const CoreMapboxTransform2 = class {
  constructor(_camera_node) {
    this._camera_node = _camera_node;
    const lng_lat = this._camera_node.pv.lng_lat;
    const lng_lat_start = {
      lng: lng_lat.x,
      lat: lng_lat.y
    };
    this.pos_offset = Utils2.fromLL(lng_lat_start.lng, lng_lat_start.lat);
  }
  transform_group2(group) {
    const core_group = new CoreGroup();
    core_group.set_objects(group.children);
    const center = core_group.center();
    const bbox = core_group.bounding_box();
    const size = core_group.size();
    const new_center = Utils2.fromLLv(center);
    const new_min = Utils2.fromLLv(bbox.min);
    const new_max = Utils2.fromLLv(bbox.max);
    const new_size = new_max.clone().sub(new_min);
    const s_offset = size.clone().multiply(new_size);
    s_offset.x = Math.abs(s_offset.x);
    s_offset.z = Math.abs(s_offset.z);
    s_offset.y = 0.5 * (s_offset.x + s_offset.z);
    const mat_tr = new Matrix42();
    const mat_tr_reset = new Matrix42();
    const mat_s = new Matrix42();
    mat_tr_reset.makeTranslation(-center.x, -center.y, -center.z);
    mat_tr.makeTranslation(new_center.x - this.pos_offset[0], new_center.y, new_center.z - this.pos_offset[1]);
    mat_s.makeScale(s_offset.x, s_offset.y, s_offset.z);
    group.traverse((object) => {
      const geometry = object.geometry;
      if (geometry) {
        geometry.applyMatrix4(mat_tr_reset);
        geometry.applyMatrix4(mat_s);
        geometry.applyMatrix4(mat_tr);
        geometry.applyMatrix4(MAT_RX);
        if (geometry.attributes.normal) {
          geometry.computeVertexNormals();
        }
      }
    });
  }
  transform_group_FINAL(object) {
    this.transform_group3(object);
  }
  transform_geometry_FINAL(geometry) {
    this.transform_geometry3(geometry);
  }
  transform_position_FINAL(position) {
    return this.transform_position3(position);
  }
  untransform_position_FINAL(position) {
    return this.untransform_position3(position);
  }
  transform_group3(group) {
    group.traverse((object) => {
      const geometry = object.geometry;
      if (geometry) {
        this.transform_geometry_FINAL(geometry);
      }
    });
  }
  transform_group(group) {
    const max_ratio = this.group_bbox_ratio(group);
    group.traverse((object) => {
      const geometry = object.geometry;
      if (geometry) {
        this.transform_geometry_with_max_ratio(geometry, max_ratio);
      }
    });
  }
  transform_geometry3(geometry) {
    const geometry_wrapper = new CoreGeometry(geometry);
    const points = geometry_wrapper.points();
    points.forEach((point) => {
      const position = point.position();
      this.transform_position_FINAL(position);
      point.set_attrib_value(POSITION_ATTRIB_NAME, position);
    });
  }
  transform_geometry_with_max_ratio(geometry, max_ratio) {
    const geometry_wrapper = new CoreGeometry(geometry);
    const points = geometry_wrapper.points();
    points.forEach((point) => {
      const position = point.position();
      this.transform_position_with_max_ratio(position, max_ratio);
      point.set_attrib_value(POSITION_ATTRIB_NAME, position);
    });
    geometry.applyMatrix4(MAT_RX);
    if (geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }
  }
  transform_position3(position) {
    const lon = position.x;
    const altitude = position.y;
    const lat = position.z;
    const mercator_pos = mapboxgl.MercatorCoordinate.fromLngLat([lon, lat], altitude);
    position.x = mercator_pos.x - this.pos_offset[0];
    position.y = mercator_pos.z || 0;
    position.z = mercator_pos.y - this.pos_offset[1];
    position.divideScalar(CoreMapboxTransform2.WORLD_SCALE);
    return position;
  }
  untransform_position3(position) {
    position.multiplyScalar(CoreMapboxTransform2.WORLD_SCALE);
    const lon = position.x + this.pos_offset[0];
    const altitude = position.y;
    const lat = position.z + this.pos_offset[1];
    const mercator = new mapboxgl.MercatorCoordinate(lon, lat, altitude);
    const lng_lat_like = mercator.toLngLat();
    position.x = lng_lat_like.lng;
    position.y = altitude;
    position.z = lng_lat_like.lat;
    return position;
  }
  transform_position_with_max_ratio(position, max_ratio) {
    const lon = position.x;
    const lat = position.z;
    const pos = Utils2.fromLL(lon, lat);
    position.x = pos[0] - this.pos_offset[0];
    position.y *= -max_ratio;
    position.z = pos[1] - this.pos_offset[1];
  }
  group_bbox_ratio(group) {
    const core_group = new CoreGroup();
    core_group.set_objects(group.children);
    const bbox = core_group.bounding_box();
    return this.bbox_ratio(bbox);
  }
  bbox_ratio(bbox) {
    const new_bbox_min = Utils2.fromLL(bbox.min.x, bbox.min.z);
    const new_bbox_max = Utils2.fromLL(bbox.max.x, bbox.max.z);
    const new_bbox_size = [new_bbox_max[1] - new_bbox_min[1], new_bbox_max[0] - new_bbox_min[0]];
    const old_bbox_size = [bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z];
    const bbox_ratio = [new_bbox_size[0] / old_bbox_size[0], new_bbox_size[1] / old_bbox_size[1]];
    return Math.max(bbox_ratio[0], bbox_ratio[1]);
  }
  static _step_size_from_zoom_interpolant() {
    return this._interpolant = this._interpolant || this._create_step_size_from_zoom_interpolant();
  }
  static _create_step_size_from_zoom_interpolant() {
    const positions = Object.keys(STEP_SIZE_BY_ZOOM).map((p) => parseFloat(p)).sort();
    const values = [];
    for (let position of positions) {
      values.push(STEP_SIZE_BY_ZOOM[position]);
    }
    const values_count = 1;
    const interpolated_values = new Float32Array(values_count);
    return new LinearInterpolant2(positions, values, values_count, interpolated_values);
  }
  static step_size_from_zoom(zoom) {
    return this._step_size_from_zoom_interpolant().evaluate(zoom)[0];
  }
};
export let CoreMapboxTransform = CoreMapboxTransform2;
CoreMapboxTransform.WORLD_SCALE = 541843220338983e-22;
