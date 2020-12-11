import {TypedSopNode} from "./_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {MaterialSopOperation} from "../../../core/operations/sop/Material";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = MaterialSopOperation.DEFAULT_PARAMS;
class MaterialSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.group = ParamConfig.STRING(DEFAULT.group);
    this.assign_mat = ParamConfig.BOOLEAN(DEFAULT.assign_mat);
    this.material = ParamConfig.NODE_PATH(DEFAULT.material.path(), {
      node_selection: {
        context: NodeContext2.MAT
      },
      dependent_on_found_node: false,
      visible_if: {assign_mat: 1}
    });
    this.apply_to_children = ParamConfig.BOOLEAN(DEFAULT.apply_to_children, {visible_if: {assign_mat: 1}});
    this.clone_mat = ParamConfig.BOOLEAN(DEFAULT.clone_mat, {visible_if: {assign_mat: 1}});
    this.share_uniforms = ParamConfig.BOOLEAN(DEFAULT.share_uniforms, {visible_if: {assign_mat: 1, clone_mat: 1}});
    this.swap_current_tex = ParamConfig.BOOLEAN(DEFAULT.swap_current_tex);
    this.tex_src0 = ParamConfig.STRING(DEFAULT.tex_src0, {visible_if: {swap_current_tex: 1}});
    this.tex_dest0 = ParamConfig.STRING(DEFAULT.tex_dest0, {visible_if: {swap_current_tex: 1}});
  }
}
const ParamsConfig2 = new MaterialSopParamsConfig();
export class MaterialSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "material";
  }
  static displayed_input_names() {
    return ["objects to assign material to"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(MaterialSopOperation.INPUT_CLONED_STATE);
  }
  async cook(input_contents) {
    this._operation = this._operation || new MaterialSopOperation(this._scene, this.states);
    const core_group = await this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}
