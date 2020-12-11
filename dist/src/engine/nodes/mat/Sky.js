import {TypedMatNode} from "./_Base";
import {Sky as Sky2} from "../../../modules/three/examples/jsm/objects/Sky";
import {ParamConfig, NodeParamsConfig} from "../utils/params/ParamsConfig";
class SkyMatParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.turbidity = ParamConfig.FLOAT(2, {
      range: [0, 20]
    });
    this.rayleigh = ParamConfig.FLOAT(1, {
      range: [0, 4]
    });
    this.mie_coefficient = ParamConfig.FLOAT(5e-3);
    this.mie_directional = ParamConfig.FLOAT(0.8);
    this.inclination = ParamConfig.FLOAT(0.5);
    this.azimuth = ParamConfig.FLOAT(0.25);
    this.up = ParamConfig.VECTOR3([0, 1, 0]);
  }
}
const ParamsConfig2 = new SkyMatParamsConfig();
export class SkyMatNode extends TypedMatNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "sky";
  }
  create_material() {
    const object = new Sky2();
    const mat = object.material;
    mat.depthWrite = true;
    return mat;
  }
  async cook() {
    const uniforms = this.material.uniforms;
    uniforms.turbidity.value = this.pv.turbidity;
    uniforms.rayleigh.value = this.pv.rayleigh;
    uniforms.mieCoefficient.value = this.pv.mie_coefficient;
    uniforms.mieDirectionalG.value = this.pv.mie_directional;
    uniforms.up.value.copy(this.pv.up);
    const theta = Math.PI * (this.pv.inclination - 0.5);
    const phi = 2 * Math.PI * (this.pv.azimuth - 0.5);
    uniforms.sunPosition.value.x = Math.cos(phi);
    uniforms.sunPosition.value.y = Math.sin(phi) * Math.sin(theta);
    uniforms.sunPosition.value.z = Math.sin(phi) * Math.cos(theta);
    this.set_material(this.material);
  }
}
