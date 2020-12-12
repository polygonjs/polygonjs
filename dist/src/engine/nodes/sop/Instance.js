import {TypedSopNode} from "./_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {InstanceSopOperation} from "../../../core/operations/sop/Instance";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = InstanceSopOperation.DEFAULT_PARAMS;
class InstanceSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.attributes_to_copy = ParamConfig.STRING(DEFAULT.attributes_to_copy);
    this.apply_material = ParamConfig.BOOLEAN(DEFAULT.apply_material);
    this.material = ParamConfig.NODE_PATH(DEFAULT.material.path(), {
      visible_if: {apply_material: 1},
      node_selection: {
        context: NodeContext2.MAT
      },
      dependent_on_found_node: false
    });
  }
}
const ParamsConfig2 = new InstanceSopParamsConfig();
export class InstanceSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "instance";
  }
  static displayed_input_names() {
    return ["geometry to be instanciated", "points to instance to"];
  }
  initialize_node() {
    super.initialize_node();
    this.io.inputs.set_count(2);
    this.io.inputs.init_inputs_cloned_state(InstanceSopOperation.INPUT_CLONED_STATE);
  }
  async cook(input_contents) {
    this._operation = this._operation || new InstanceSopOperation(this.scene, this.states);
    const core_group = await this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}
