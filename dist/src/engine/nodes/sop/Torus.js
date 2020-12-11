import {TorusBufferGeometry as TorusBufferGeometry2} from "three/src/geometries/TorusBufferGeometry";
import {TypedSopNode} from "./_Base";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class TorusSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.radius = ParamConfig.FLOAT(1, {range: [0, 1]});
    this.radius_tube = ParamConfig.FLOAT(1, {range: [0, 1]});
    this.segments_radial = ParamConfig.INTEGER(20, {
      range: [1, 50],
      range_locked: [true, false]
    });
    this.segments_tube = ParamConfig.INTEGER(12, {
      range: [1, 50],
      range_locked: [true, false]
    });
  }
}
const ParamsConfig2 = new TorusSopParamsConfig();
export class TorusSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "torus";
  }
  initialize_node() {
  }
  cook() {
    const radius = this.pv.radius;
    const radius_tube = this.pv.radius_tube;
    const segments_radial = this.pv.segments_radial;
    const segments_tube = this.pv.segments_tube;
    const geometry = new TorusBufferGeometry2(radius, radius_tube, segments_radial, segments_tube);
    this.set_geometry(geometry);
  }
}
