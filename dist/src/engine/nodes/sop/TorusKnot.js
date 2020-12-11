import {TorusKnotBufferGeometry as TorusKnotBufferGeometry2} from "three/src/geometries/TorusKnotBufferGeometry";
import {TypedSopNode} from "./_Base";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class TorusKnotSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.radius = ParamConfig.FLOAT(1);
    this.radius_tube = ParamConfig.FLOAT(1);
    this.segments_radial = ParamConfig.INTEGER(64, {range: [1, 128]});
    this.segments_tube = ParamConfig.INTEGER(8, {range: [1, 32]});
    this.p = ParamConfig.INTEGER(2, {range: [1, 10]});
    this.q = ParamConfig.INTEGER(3, {range: [1, 10]});
  }
}
const ParamsConfig2 = new TorusKnotSopParamsConfig();
export class TorusKnotSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "torus_knot";
  }
  initialize_node() {
  }
  cook() {
    const radius = this.pv.radius;
    const radius_tube = this.pv.radius_tube;
    const segments_radial = this.pv.segments_radial;
    const segments_tube = this.pv.segments_tube;
    const p = this.pv.p;
    const q = this.pv.q;
    const geometry = new TorusKnotBufferGeometry2(radius, radius_tube, segments_radial, segments_tube, p, q);
    this.set_geometry(geometry);
  }
}
