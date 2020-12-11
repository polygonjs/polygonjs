import {BaseSopOperation} from "./_Base";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {ObjectType} from "../../../core/geometry/Constant";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {BufferAttribute as BufferAttribute2} from "three/src/core/BufferAttribute";
export class AddSopOperation extends BaseSopOperation {
  static type() {
    return "add";
  }
  cook(input_contents, params) {
    const objects = [];
    this._create_point(objects, params);
    return this.create_core_group_from_objects(objects);
  }
  _create_point(objects, params) {
    if (params.create_point) {
      const geometry = new BufferGeometry2();
      const positions = [];
      for (let i = 0; i < params.points_count; i++) {
        params.position.toArray(positions, i * 3);
      }
      geometry.setAttribute("position", new BufferAttribute2(new Float32Array(positions), 3));
      const object = this.create_object(geometry, ObjectType.POINTS);
      if (objects) {
        objects.push(object);
      }
    }
  }
}
AddSopOperation.DEFAULT_PARAMS = {
  create_point: true,
  points_count: 1,
  position: new Vector32(0, 0, 0),
  open: false,
  connect_to_last_point: false
};
