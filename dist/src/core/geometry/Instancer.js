import lodash_isNumber from "lodash/isNumber";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Quaternion as Quaternion2} from "three/src/math/Quaternion";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import {InstancedBufferGeometry as InstancedBufferGeometry2} from "three/src/core/InstancedBufferGeometry";
import {InstancedBufferAttribute as InstancedBufferAttribute2} from "three/src/core/InstancedBufferAttribute";
import {CoreGeometry} from "./Geometry";
const DEFAULT = {
  SCALE: new Vector32(1, 1, 1),
  PSCALE: 1,
  EYE: new Vector32(0, 0, 0),
  UP: new Vector32(0, 1, 0)
};
const SCALE_ATTRIB_NAME = "scale";
const PSCALE_ATTRIB_NAME = "pscale";
const NORMAL_ATTRIB_NAME = "normal";
const UP_ATTRIB_NAME = "up";
const MATRIX_T = "translate";
const MATRIX_R = "rotate";
const MATRIX_S = "scale";
const DEFAULT_COLOR = new Vector32(1, 1, 1);
const DEFAULT_UV = new Vector22(0, 0);
const ATTRIB_NAME_UV = "uv";
const ATTRIB_NAME_COLOR = "color";
const CoreInstancer2 = class {
  constructor(_group_wrapper) {
    this._group_wrapper = _group_wrapper;
    this._matrices = {};
    this._point_scale = new Vector32();
    this._point_normal = new Vector32();
    this._point_up = new Vector32();
    this._is_pscale_present = this._group_wrapper.has_attrib("pscale");
    this._is_scale_present = this._group_wrapper.has_attrib("scale");
    this._is_normal_present = this._group_wrapper.has_attrib("normal");
    this._is_up_present = this._group_wrapper.has_attrib("up");
    this._do_rotate_matrices = this._is_normal_present;
  }
  matrices() {
    this._matrices = {};
    this._matrices[MATRIX_T] = new Matrix42();
    this._matrices[MATRIX_R] = new Matrix42();
    this._matrices[MATRIX_S] = new Matrix42();
    return this._group_wrapper.points().map((point) => {
      const matrix = new Matrix42();
      this._matrix_from_point(point, matrix);
      return matrix;
    });
  }
  _matrix_from_point(point, matrix) {
    const t = point.position();
    if (this._is_scale_present) {
      point.attrib_value(SCALE_ATTRIB_NAME, this._point_scale);
    } else {
      this._point_scale.copy(DEFAULT.SCALE);
    }
    const pscale = this._is_pscale_present ? point.attrib_value(PSCALE_ATTRIB_NAME) : DEFAULT.PSCALE;
    this._point_scale.multiplyScalar(pscale);
    const scale_matrix = this._matrices[MATRIX_S];
    scale_matrix.makeScale(this._point_scale.x, this._point_scale.y, this._point_scale.z);
    const translate_matrix = this._matrices[MATRIX_T];
    translate_matrix.makeTranslation(t.x, t.y, t.z);
    matrix.multiply(translate_matrix);
    if (this._do_rotate_matrices) {
      const rotate_matrix = this._matrices[MATRIX_R];
      const eye = DEFAULT.EYE;
      point.attrib_value(NORMAL_ATTRIB_NAME, this._point_normal);
      this._point_normal.multiplyScalar(-1);
      if (this._is_up_present) {
        point.attrib_value(UP_ATTRIB_NAME, this._point_up);
      } else {
        this._point_up.copy(DEFAULT.UP);
      }
      this._point_up.normalize();
      rotate_matrix.lookAt(eye, this._point_normal, this._point_up);
      matrix.multiply(rotate_matrix);
    }
    matrix.multiply(scale_matrix);
  }
  static create_instance_buffer_geo(geometry_to_instance, template_core_group, attributes_to_copy) {
    const instance_pts = template_core_group.points();
    const geometry = new InstancedBufferGeometry2();
    geometry.copy(geometry_to_instance);
    geometry.instanceCount = Infinity;
    const instances_count = instance_pts.length;
    const positions = new Float32Array(instances_count * 3);
    const colors = new Float32Array(instances_count * 3);
    const scales = new Float32Array(instances_count * 3);
    const orients = new Float32Array(instances_count * 4);
    const has_color = template_core_group.has_attrib(ATTRIB_NAME_COLOR);
    const position = new Vector32(0, 0, 0);
    const quaternion = new Quaternion2();
    const scale = new Vector32(1, 1, 1);
    const instancer = new CoreInstancer2(template_core_group);
    const instance_matrices = instancer.matrices();
    instance_pts.forEach((instance_pt, i) => {
      const index3 = i * 3;
      const index4 = i * 4;
      const matrix = instance_matrices[i];
      matrix.decompose(position, quaternion, scale);
      position.toArray(positions, index3);
      quaternion.toArray(orients, index4);
      scale.toArray(scales, index3);
      const color = has_color ? instance_pt.attrib_value(ATTRIB_NAME_COLOR, this._point_color) : DEFAULT_COLOR;
      color.toArray(colors, index3);
    });
    const has_uv = template_core_group.has_attrib(ATTRIB_NAME_UV);
    if (has_uv) {
      const uvs = new Float32Array(instances_count * 2);
      instance_pts.forEach((instance_pt, i) => {
        const index2 = i * 2;
        const uv = has_uv ? instance_pt.attrib_value(ATTRIB_NAME_UV, this._point_uv) : DEFAULT_UV;
        uv.toArray(uvs, index2);
      });
      geometry.setAttribute("instanceUv", new InstancedBufferAttribute2(uvs, 2));
    }
    geometry.setAttribute("instancePosition", new InstancedBufferAttribute2(positions, 3));
    geometry.setAttribute("instanceScale", new InstancedBufferAttribute2(scales, 3));
    geometry.setAttribute("instanceOrientation", new InstancedBufferAttribute2(orients, 4));
    geometry.setAttribute("instanceColor", new InstancedBufferAttribute2(colors, 3));
    const attrib_names = template_core_group.attrib_names_matching_mask(attributes_to_copy);
    attrib_names.forEach((attrib_name) => {
      const attrib_size = template_core_group.attrib_size(attrib_name);
      const values = new Float32Array(instances_count * attrib_size);
      instance_pts.forEach((pt, i) => {
        const value = pt.attrib_value(attrib_name);
        if (lodash_isNumber(value)) {
          values[i] = value;
        } else {
          value.toArray(values, i * attrib_size);
        }
      });
      geometry.setAttribute(attrib_name, new InstancedBufferAttribute2(values, attrib_size));
    });
    const core_geometry = new CoreGeometry(geometry);
    core_geometry.mark_as_instance();
    return geometry;
  }
};
export let CoreInstancer = CoreInstancer2;
CoreInstancer._point_color = new Vector32();
CoreInstancer._point_uv = new Vector22();
