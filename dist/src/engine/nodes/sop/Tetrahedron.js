import {TypedSopNode} from "./_Base";
import {TetrahedronBufferGeometry} from "../../../core/geometry/operation/Tetrahedron";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {ObjectType} from "../../../core/geometry/Constant";
class TetrahedronSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.radius = ParamConfig.FLOAT(1);
    this.detail = ParamConfig.INTEGER(0, {
      range: [0, 10],
      range_locked: [true, false]
    });
    this.points_only = ParamConfig.BOOLEAN(0);
    this.center = ParamConfig.VECTOR3([0, 0, 0]);
  }
}
const ParamsConfig2 = new TetrahedronSopParamsConfig();
export class TetrahedronSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "tetrahedron";
  }
  cook() {
    const points_only = this.pv.points_only;
    const geometry = new TetrahedronBufferGeometry(this.pv.radius, this.pv.detail, points_only);
    geometry.translate(this.pv.center.x, this.pv.center.y, this.pv.center.z);
    if (points_only) {
      const object = this.create_object(geometry, ObjectType.POINTS);
      this.set_object(object);
    } else {
      geometry.computeVertexNormals();
      this.set_geometry(geometry);
    }
  }
}
