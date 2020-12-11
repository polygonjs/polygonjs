import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import VertexShader from "./Image/vert.glsl";
import FragmentShader from "./Image/frag.glsl";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {OPERATOR_PATH_DEFAULT} from "../../params/OperatorPath";
class ImagePostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.map = ParamConfig.OPERATOR_PATH(OPERATOR_PATH_DEFAULT.NODE.UV, {
      node_selection: {context: NodeContext2.COP},
      ...PostParamOptions
    });
    this.darkness = ParamConfig.FLOAT(0, {
      range: [0, 2],
      range_locked: [true, false],
      ...PostParamOptions
    });
    this.offset = ParamConfig.FLOAT(0, {
      range: [0, 2],
      range_locked: [true, false],
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new ImagePostParamsConfig();
export class ImagePostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "image";
  }
  static _create_shader() {
    return {
      uniforms: {
        tDiffuse: {value: null},
        map: {value: null},
        offset: {value: 1},
        darkness: {value: 1}
      },
      vertexShader: VertexShader,
      fragmentShader: FragmentShader
    };
  }
  _create_pass(context) {
    const pass = new ShaderPass2(ImagePostNode._create_shader());
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.darkness.value = this.pv.darkness;
    pass.uniforms.offset.value = this.pv.offset;
    this._update_map(pass);
  }
  async _update_map(pass) {
    if (this.p.map.is_dirty) {
      await this.p.map.compute();
    }
    const found_node = this.p.map.found_node();
    if (found_node) {
      if (found_node.node_context() == NodeContext2.COP) {
        const cop_node = found_node;
        const map_container = await cop_node.request_container();
        const texture = map_container.core_content();
        pass.uniforms.map.value = texture;
      } else {
        this.states.error.set("node is not COP");
      }
    } else {
      this.states.error.set("no map found");
    }
  }
}
