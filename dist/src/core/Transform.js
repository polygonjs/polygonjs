import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Quaternion as Quaternion2} from "three/src/math/Quaternion";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import {Euler as Euler2} from "three/src/math/Euler";
import {MathUtils as MathUtils2} from "three/src/math/MathUtils";
export var TransformTargetType;
(function(TransformTargetType2) {
  TransformTargetType2["OBJECTS"] = "objects";
  TransformTargetType2["GEOMETRIES"] = "geometries";
})(TransformTargetType || (TransformTargetType = {}));
export const TRANSFORM_TARGET_TYPES = [
  TransformTargetType.GEOMETRIES,
  TransformTargetType.OBJECTS
];
export var RotationOrder;
(function(RotationOrder2) {
  RotationOrder2["XYZ"] = "XYZ";
  RotationOrder2["XZY"] = "XZY";
  RotationOrder2["YXZ"] = "YXZ";
  RotationOrder2["YZX"] = "YZX";
  RotationOrder2["ZYX"] = "ZYX";
  RotationOrder2["ZXY"] = "ZXY";
})(RotationOrder || (RotationOrder = {}));
export const ROTATION_ORDERS = [
  RotationOrder.XYZ,
  RotationOrder.XZY,
  RotationOrder.YXZ,
  RotationOrder.YZX,
  RotationOrder.ZXY,
  RotationOrder.ZYX
];
export const DEFAULT_ROTATION_ORDER = RotationOrder.XYZ;
export class CoreTransform {
  constructor() {
    this._translation_matrix = new Matrix42();
    this._translation_matrix_q = new Quaternion2();
    this._translation_matrix_s = new Vector32(1, 1, 1);
    this._matrix = new Matrix42().identity();
    this._matrix_q = new Quaternion2();
    this._matrix_euler = new Euler2();
    this._matrix_s = new Vector32();
    this._rotate_geometry_m = new Matrix42();
    this._rotate_geometry_q = new Quaternion2();
    this._rotate_geometry_vec_dest = new Vector32();
  }
  static set_params_from_matrix(matrix, node, options = {}) {
    let update_scale = options["scale"];
    if (update_scale == null) {
      update_scale = true;
    }
    matrix.decompose(this.set_params_from_matrix_position, this.set_params_from_matrix_quaternion, this.set_params_from_matrix_scale);
    this.set_params_from_matrix_euler.setFromQuaternion(this.set_params_from_matrix_quaternion);
    this.set_params_from_matrix_euler.toVector3(this.set_params_from_matrix_rotation);
    this.set_params_from_matrix_rotation.divideScalar(Math.PI / 180);
    this.set_params_from_matrix_position.toArray(this.set_params_from_matrix_t);
    this.set_params_from_matrix_rotation.toArray(this.set_params_from_matrix_r);
    this.set_params_from_matrix_scale.toArray(this.set_params_from_matrix_s);
    node.scene.batch_update(() => {
      node.params.set_vector3("t", this.set_params_from_matrix_t);
      node.params.set_vector3("r", this.set_params_from_matrix_r);
      node.params.set_vector3("s", this.set_params_from_matrix_s);
      if (update_scale) {
        node.params.set_float("scale", 1);
      }
    });
  }
  static set_params_from_object(object, node) {
    object.position.toArray(this.set_params_from_object_position_array);
    object.rotation.toArray(this.set_params_from_object_rotation_array);
    this.set_params_from_object_rotation_deg.fromArray(this.set_params_from_object_rotation_array);
    this.set_params_from_object_rotation_deg.multiplyScalar(180 / Math.PI);
    this.set_params_from_object_rotation_deg.toArray(this.set_params_from_object_rotation_array);
    node.scene.batch_update(() => {
      node.params.set_vector3("t", this.set_params_from_object_position_array);
      node.params.set_vector3("r", this.set_params_from_object_rotation_array);
    });
  }
  translation_matrix(t) {
    this._translation_matrix.compose(t, this._translation_matrix_q, this._translation_matrix_s);
    return this._translation_matrix;
  }
  matrix(t, r, s, scale, rotation_order) {
    this._matrix_euler.set(MathUtils2.degToRad(r.x), MathUtils2.degToRad(r.y), MathUtils2.degToRad(r.z), rotation_order);
    this._matrix_q.setFromEuler(this._matrix_euler);
    this._matrix_s.copy(s).multiplyScalar(scale);
    this._matrix.compose(t, this._matrix_q, this._matrix_s);
    return this._matrix;
  }
  rotate_geometry(geometry, vec_origin, vec_dest) {
    this._rotate_geometry_vec_dest.copy(vec_dest);
    this._rotate_geometry_vec_dest.normalize();
    this._rotate_geometry_q.setFromUnitVectors(vec_origin, this._rotate_geometry_vec_dest);
    this._rotate_geometry_m.makeRotationFromQuaternion(this._rotate_geometry_q);
    geometry.applyMatrix4(this._rotate_geometry_m);
  }
  static decompose_matrix(object) {
    object.matrix.decompose(object.position, object.quaternion, object.scale);
  }
}
CoreTransform.set_params_from_matrix_position = new Vector32();
CoreTransform.set_params_from_matrix_quaternion = new Quaternion2();
CoreTransform.set_params_from_matrix_scale = new Vector32();
CoreTransform.set_params_from_matrix_euler = new Euler2();
CoreTransform.set_params_from_matrix_rotation = new Vector32();
CoreTransform.set_params_from_matrix_t = [0, 0, 0];
CoreTransform.set_params_from_matrix_r = [0, 0, 0];
CoreTransform.set_params_from_matrix_s = [0, 0, 0];
CoreTransform.set_params_from_object_position_array = [0, 0, 0];
CoreTransform.set_params_from_object_rotation_deg = new Vector32();
CoreTransform.set_params_from_object_rotation_array = [0, 0, 0];
