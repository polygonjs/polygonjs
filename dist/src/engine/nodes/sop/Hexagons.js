import {Vector3 as Vector32} from "three/src/math/Vector3";
import {TypedSopNode} from "./_Base";
import {CoreTransform} from "../../../core/Transform";
import {ObjectType} from "../../../core/geometry/Constant";
import {CoreGeometryOperationHexagon} from "../../../core/geometry/operation/Hexagon";
const DEFAULT_UP = new Vector32(0, 1, 0);
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class HexagonsSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.size = ParamConfig.VECTOR2([1, 1]);
    this.hexagon_radius = ParamConfig.FLOAT(0.1, {
      range: [1e-3, 1],
      range_locked: [false, false]
    });
    this.direction = ParamConfig.VECTOR3([0, 1, 0]);
    this.points_only = ParamConfig.BOOLEAN(0);
  }
}
const ParamsConfig2 = new HexagonsSopParamsConfig();
export class HexagonsSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._core_transform = new CoreTransform();
  }
  static type() {
    return "hexagons";
  }
  initialize_node() {
  }
  cook() {
    if (this.pv.hexagon_radius > 0) {
      const operation = new CoreGeometryOperationHexagon(this.pv.size, this.pv.hexagon_radius, this.pv.points_only);
      const geometry = operation.process();
      this._core_transform.rotate_geometry(geometry, DEFAULT_UP, this.pv.direction);
      if (this.pv.points_only) {
        this.set_geometry(geometry, ObjectType.POINTS);
      } else {
        this.set_geometry(geometry);
      }
    } else {
      this.set_objects([]);
    }
  }
}
