import {TypedSopNode} from "./_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {AttribFromTextureSopOperation} from "../../../core/operations/sop/AttribFromTexture";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = AttribFromTextureSopOperation.DEFAULT_PARAMS;
class AttribFromTextureSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.texture = ParamConfig.NODE_PATH(DEFAULT.texture.path(), {
      node_selection: {context: NodeContext2.COP}
    });
    this.uv_attrib = ParamConfig.STRING(DEFAULT.uv_attrib);
    this.attrib = ParamConfig.STRING(DEFAULT.attrib);
    this.add = ParamConfig.FLOAT(DEFAULT.add);
    this.mult = ParamConfig.FLOAT(DEFAULT.mult);
  }
}
const ParamsConfig2 = new AttribFromTextureSopParamsConfig();
export class AttribFromTextureSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "attrib_from_texture";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.attrib]);
      });
    });
  }
  async cook(input_contents) {
    this._operation = this._operation || new AttribFromTextureSopOperation(this.scene, this.states);
    const core_group = await this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}
