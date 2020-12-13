import {BaseSopOperation} from "./_Base";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {CoreGeometryUtilCircle} from "../../geometry/util/Circle";
import {ObjectType} from "../../geometry/Constant";
import {CoreTransform} from "../../Transform";
import {CircleBufferGeometry as CircleBufferGeometry2} from "three/src/geometries/CircleBufferGeometry";
const DEFAULT_UP = new Vector32(0, 0, 1);
export class CircleSopOperation extends BaseSopOperation {
  constructor() {
    super(...arguments);
    this._core_transform = new CoreTransform();
  }
  static type() {
    return "circle";
  }
  cook(input_contents, params) {
    if (params.open) {
      return this._create_circle(params);
    } else {
      return this._create_disk(params);
    }
  }
  _create_circle(params) {
    const geometry = CoreGeometryUtilCircle.create(params.radius, params.segments, params.arc_angle);
    this._core_transform.rotate_geometry(geometry, DEFAULT_UP, params.direction);
    return this.create_core_group_from_geometry(geometry, ObjectType.LINE_SEGMENTS);
  }
  _create_disk(params) {
    const geometry = new CircleBufferGeometry2(params.radius, params.segments);
    this._core_transform.rotate_geometry(geometry, DEFAULT_UP, params.direction);
    return this.create_core_group_from_geometry(geometry);
  }
}
CircleSopOperation.DEFAULT_PARAMS = {
  radius: 1,
  segments: 12,
  open: true,
  arc_angle: 360,
  direction: new Vector32(0, 1, 0)
};
