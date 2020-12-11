import {NodeParamsConfig, ParamConfig} from "../../utils/params/ParamsConfig";
import {TypedMatNode} from "../_Base";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {Box3 as Box32} from "three/src/math/Box3";
export function TextureMapParamConfig(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.color = ParamConfig.COLOR([1, 1, 1]);
      this.step_size = ParamConfig.FLOAT(0.01);
      this.density = ParamConfig.FLOAT(1);
      this.shadow_density = ParamConfig.FLOAT(1);
      this.light_dir = ParamConfig.VECTOR3([-1, -1, -1]);
    }
  };
}
class VolumeMaterial extends ShaderMaterial2 {
}
class TextureMapParamsConfig extends TextureMapParamConfig(NodeParamsConfig) {
}
class VolumeMatNode extends TypedMatNode {
}
export class VolumeController {
  constructor(node) {
    this.node = node;
  }
  static render_hook(renderer, scene, camera, geometry, material, group, object) {
    if (object) {
      this._object_bbox.setFromObject(object);
      const shader_material = material;
      shader_material.uniforms.u_BoundingBoxMin.value.copy(this._object_bbox.min);
      shader_material.uniforms.u_BoundingBoxMax.value.copy(this._object_bbox.max);
    }
  }
  update_uniforms_from_params() {
    const uniforms = this.node.material.uniforms;
    uniforms.u_Color.value.copy(this.node.pv.color);
    uniforms.u_StepSize.value = this.node.pv.step_size;
    uniforms.u_VolumeDensity.value = this.node.pv.density;
    uniforms.u_ShadowDensity.value = this.node.pv.shadow_density;
    const dir_light = uniforms.u_DirectionalLightDirection.value;
    const pv_dir_light = this.node.pv.light_dir;
    if (dir_light) {
      dir_light.x = pv_dir_light.x;
      dir_light.y = pv_dir_light.y;
      dir_light.z = pv_dir_light.z;
    }
  }
}
VolumeController._object_bbox = new Box32();
