import {BaseSopOperation} from "./_Base";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {IcosahedronBufferGeometry} from "../../geometry/operation/Icosahedron";
import {ObjectType} from "../../geometry/Constant";
export class IcosahedronSopOperation extends BaseSopOperation {
  static type() {
    return "icosahedron";
  }
  cook(input_contents, params) {
    const points_only = params.points_only;
    const geometry = new IcosahedronBufferGeometry(params.radius, params.detail, points_only);
    geometry.translate(params.center.x, params.center.y, params.center.z);
    if (points_only) {
      const object = this.create_object(geometry, ObjectType.POINTS);
      return this.create_core_group_from_objects([object]);
    } else {
      geometry.computeVertexNormals();
      return this.create_core_group_from_geometry(geometry);
    }
  }
}
IcosahedronSopOperation.DEFAULT_PARAMS = {
  radius: 1,
  detail: 0,
  points_only: false,
  center: new Vector32(0, 0, 0)
};
