import {TypedSopNode} from "./_Base";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {CylinderBufferGeometry as CylinderBufferGeometry2} from "three/src/geometries/CylinderBufferGeometry";
import {CoreTransform} from "../../../core/Transform";
const DEFAULT_UP = new Vector32(0, 1, 0);
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class TubeSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.radius = ParamConfig.FLOAT(1, {range: [0, 1]});
    this.height = ParamConfig.FLOAT(1, {range: [0, 1]});
    this.segments_radial = ParamConfig.INTEGER(12, {range: [3, 20], range_locked: [true, false]});
    this.segments_height = ParamConfig.INTEGER(1, {range: [1, 20], range_locked: [true, false]});
    this.cap = ParamConfig.BOOLEAN(1);
    this.center = ParamConfig.VECTOR3([0, 0, 0]);
    this.direction = ParamConfig.VECTOR3([0, 0, 1]);
  }
}
const ParamsConfig2 = new TubeSopParamsConfig();
export class TubeSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._core_transform = new CoreTransform();
  }
  static type() {
    return "tube";
  }
  cook() {
    const geometry = new CylinderBufferGeometry2(this.pv.radius, this.pv.radius, this.pv.height, this.pv.segments_radial, this.pv.segments_height, !this.pv.cap);
    this._core_transform.rotate_geometry(geometry, DEFAULT_UP, this.pv.direction);
    geometry.translate(this.pv.center.x, this.pv.center.y, this.pv.center.z);
    this.set_geometry(geometry);
  }
}
