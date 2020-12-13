import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {TypedMatNode} from "./_Base";
import {SubsurfaceScatteringShader as SubsurfaceScatteringShader2} from "../../../modules/three/examples/jsm/shaders/SubsurfaceScatteringShader";
import {SideController as SideController2, SideParamConfig} from "./utils/SideController";
import {SkinningController as SkinningController2, SkinningParamConfig} from "./utils/SkinningController";
import {TextureMapController as TextureMapController2, TextureMapParamConfig} from "./utils/TextureMapController";
import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {TextureAlphaMapController as TextureAlphaMapController2, TextureAlphaMapParamConfig} from "./utils/TextureAlphaMapController";
function ParamOptionsFactoryColor(uniform_name) {
  return {
    cook: false,
    callback: (node, param) => {
      MeshSubsurfaceScatteringMatNode.PARAM_CALLBACK_update_uniformColor(node, param, uniform_name);
    }
  };
}
function ParamOptionsFactoryTexture(uniform_name) {
  return {
    cook: false,
    callback: (node, param) => {
      MeshSubsurfaceScatteringMatNode.PARAM_CALLBACK_update_uniformTexture(node, param, uniform_name);
    }
  };
}
function ParamOptionsFactoryN(uniform_name) {
  return {
    cook: false,
    callback: (node, param) => {
      MeshSubsurfaceScatteringMatNode.PARAM_CALLBACK_update_uniformN(node, param, uniform_name);
    }
  };
}
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {OPERATOR_PATH_DEFAULT} from "../../params/OperatorPath";
class MeshSubsurfaceScatteringMatParamsConfig extends TextureMapParamConfig(TextureAlphaMapParamConfig(SkinningParamConfig(SideParamConfig(NodeParamsConfig)))) {
  constructor() {
    super(...arguments);
    this.diffuse = ParamConfig.COLOR([1, 1, 1], {
      ...ParamOptionsFactoryColor("diffuse")
    });
    this.shininess = ParamConfig.FLOAT(1, {
      range: [0, 1e3]
    });
    this.thickness_map = ParamConfig.OPERATOR_PATH(OPERATOR_PATH_DEFAULT.NODE.UV, {
      node_selection: {context: NodeContext2.COP},
      ...ParamOptionsFactoryTexture("thicknessMap")
    });
    this.thickness_color = ParamConfig.COLOR([0.5, 0.3, 0], {
      ...ParamOptionsFactoryColor("thicknessColor")
    });
    this.thickness_distortion = ParamConfig.FLOAT(0.1, {
      ...ParamOptionsFactoryN("thicknessDistortion")
    });
    this.thickness_ambient = ParamConfig.FLOAT(0.4, {
      ...ParamOptionsFactoryN("thicknessAmbient")
    });
    this.thickness_attenuation = ParamConfig.FLOAT(0.8, {
      ...ParamOptionsFactoryN("thicknessAttenuation")
    });
    this.thickness_power = ParamConfig.FLOAT(2, {
      range: [0, 10],
      ...ParamOptionsFactoryN("thicknessPower")
    });
    this.thickness_scale = ParamConfig.FLOAT(16, {
      range: [0, 100],
      ...ParamOptionsFactoryN("thicknessScale")
    });
  }
}
const ParamsConfig2 = new MeshSubsurfaceScatteringMatParamsConfig();
export class MeshSubsurfaceScatteringMatNode extends TypedMatNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.texture_map_controller = new TextureMapController2(this, {
      uniforms: true
    });
    this.texture_alpha_map_controller = new TextureAlphaMapController2(this, {
      uniforms: true
    });
  }
  static type() {
    return "mesh_subsurface_scattering";
  }
  create_material() {
    const uniforms = UniformsUtils2.clone(SubsurfaceScatteringShader2.uniforms);
    const material = new ShaderMaterial2({
      uniforms,
      vertexShader: SubsurfaceScatteringShader2.vertexShader,
      fragmentShader: SubsurfaceScatteringShader2.fragmentShader,
      lights: true
    });
    material.extensions.derivatives = true;
    return material;
  }
  initialize_node() {
    this.params.on_params_created("init controllers", () => {
      this.texture_map_controller.initialize_node();
      this.texture_alpha_map_controller.initialize_node();
    });
  }
  async cook() {
    SideController2.update(this);
    SkinningController2.update(this);
    this.texture_map_controller.update();
    this.texture_alpha_map_controller.update();
    this.update_map(this.p.thickness_map, "thicknessMap");
    this.material.uniforms.diffuse.value.copy(this.pv.diffuse);
    this.material.uniforms.shininess.value = this.pv.shininess;
    this.material.uniforms.thicknessColor.value.copy(this.pv.thickness_color);
    this.material.uniforms.thicknessDistortion.value = this.pv.thickness_distortion;
    this.material.uniforms.thicknessAmbient.value = this.pv.thickness_ambient;
    this.material.uniforms.thicknessAttenuation.value = this.pv.thickness_attenuation;
    this.material.uniforms.thicknessPower.value = this.pv.thickness_power;
    this.material.uniforms.thicknessScale.value = this.pv.thickness_scale;
    this.set_material(this.material);
  }
  static PARAM_CALLBACK_update_uniformN(node, param, uniform_name) {
    node.material.uniforms[uniform_name].value = param.value;
  }
  static PARAM_CALLBACK_update_uniformColor(node, param, uniform_name) {
    if (param.parent_param) {
      node.material.uniforms[uniform_name].value.copy(param.parent_param.value);
    }
  }
  static PARAM_CALLBACK_update_uniformTexture(node, param, uniform_name) {
    node.update_map(param, uniform_name);
  }
  async update_map(param, uniform_name) {
    const node = param.found_node();
    if (node) {
      if (node.node_context() == NodeContext2.COP) {
        const texture_node = node;
        const container = await texture_node.request_container();
        this.material.uniforms[uniform_name].value = container.texture();
        return;
      }
    }
    this.material.uniforms[uniform_name].value = null;
  }
}
