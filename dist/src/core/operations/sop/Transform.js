import {BaseSopOperation} from "./_Base";
import {CoreGroup} from "../../geometry/Group";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {TypeAssert} from "../../../engine/poly/Assert";
import {
  CoreTransform,
  ROTATION_ORDERS,
  RotationOrder,
  TransformTargetType,
  TRANSFORM_TARGET_TYPES
} from "../../../core/Transform";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export class TransformSopOperation extends BaseSopOperation {
  constructor() {
    super(...arguments);
    this._core_transform = new CoreTransform();
    this._object_position = new Vector32();
  }
  static type() {
    return "transform";
  }
  cook(input_contents, params) {
    const objects = input_contents[0].objects_with_geo();
    const matrix = this._core_transform.matrix(params.t, params.r, params.s, params.scale, ROTATION_ORDERS[params.rotation_order]);
    this._apply_transform(objects, params, matrix);
    return input_contents[0];
  }
  _apply_transform(objects, params, matrix) {
    const mode = TRANSFORM_TARGET_TYPES[params.apply_on];
    switch (mode) {
      case TransformTargetType.GEOMETRIES: {
        return this._apply_matrix_to_geometries(objects, params, matrix);
      }
      case TransformTargetType.OBJECTS: {
        return this._apply_matrix_to_objects(objects, params, matrix);
      }
    }
    TypeAssert.unreachable(mode);
  }
  _apply_matrix_to_geometries(objects, params, matrix) {
    if (params.group === "") {
      for (let object of objects) {
        let geometry;
        if ((geometry = object.geometry) != null) {
          geometry.translate(-params.pivot.x, -params.pivot.y, -params.pivot.z);
          geometry.applyMatrix4(matrix);
          geometry.translate(params.pivot.x, params.pivot.y, params.pivot.z);
        } else {
          object.applyMatrix4(matrix);
        }
      }
    } else {
      const core_group = CoreGroup.from_objects(objects);
      const points = core_group.points_from_group(params.group);
      for (let point of points) {
        const position = point.position().sub(params.pivot);
        position.applyMatrix4(matrix);
        point.set_position(position.add(params.pivot));
      }
    }
  }
  _apply_matrix_to_objects(objects, params, matrix) {
    for (let object of objects) {
      this._object_position.copy(object.position);
      object.position.multiplyScalar(0);
      object.updateMatrix();
      object.applyMatrix4(matrix);
      object.position.add(this._object_position);
      object.updateMatrix();
    }
  }
}
TransformSopOperation.DEFAULT_PARAMS = {
  apply_on: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES),
  group: "",
  rotation_order: ROTATION_ORDERS.indexOf(RotationOrder.XYZ),
  t: new Vector32(0, 0, 0),
  r: new Vector32(0, 0, 0),
  s: new Vector32(1, 1, 1),
  scale: 1,
  pivot: new Vector32(0, 0, 0)
};
TransformSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
