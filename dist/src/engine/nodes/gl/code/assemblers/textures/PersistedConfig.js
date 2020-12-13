import {BasePersistedConfig} from "../../../../utils/PersistedConfig";
import {BuilderCopNode} from "../../../../cop/Builder";
import {GlParamConfig} from "../../utils/ParamConfig";
export class TexturePersistedConfig extends BasePersistedConfig {
  constructor(node) {
    super(node);
    this.node = node;
  }
  to_json() {
    if (!this.node.assembler_controller) {
      return;
    }
    const param_uniform_pairs = [];
    const param_configs = this.node.assembler_controller.assembler.param_configs();
    for (let param_config of param_configs) {
      param_uniform_pairs.push([param_config.name, param_config.uniform_name]);
    }
    const data = {
      fragment_shader: this.node.texture_material.fragmentShader,
      uniforms: this.node.texture_material.uniforms,
      param_uniform_pairs,
      uniforms_time_dependent: this.node.assembler_controller.assembler.uniforms_time_dependent(),
      uniforms_resolution_dependent: this.node.assembler_controller.assembler.resolution_dependent()
    };
    return data;
  }
  load(data) {
    this.node.texture_material.fragmentShader = data.fragment_shader;
    this.node.texture_material.uniforms = data.uniforms;
    BuilderCopNode.handle_dependencies(this.node, data.uniforms_time_dependent || false, data.uniforms);
    for (let pair of data.param_uniform_pairs) {
      const param = this.node.params.get(pair[0]);
      const uniform = data.uniforms[pair[1]];
      if (param && uniform) {
        param.options.set({
          callback: () => {
            GlParamConfig.callback(param, uniform);
          }
        });
      }
    }
  }
}
