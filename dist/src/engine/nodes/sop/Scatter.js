import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {ScatterSopOperation} from "../../../core/operations/sop/Scatter";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = ScatterSopOperation.DEFAULT_PARAMS;
class ScatterSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.points_count = ParamConfig.INTEGER(DEFAULT.points_count, {
      range: [0, 100],
      range_locked: [true, false]
    });
    this.seed = ParamConfig.INTEGER(DEFAULT.seed, {
      range: [0, 100],
      range_locked: [false, false]
    });
    this.transfer_attributes = ParamConfig.BOOLEAN(DEFAULT.transfer_attributes);
    this.attributes_to_transfer = ParamConfig.STRING(DEFAULT.attributes_to_transfer, {
      visible_if: {transfer_attributes: 1}
    });
    this.add_id_attribute = ParamConfig.BOOLEAN(DEFAULT.add_id_attribute);
    this.add_idn_attribute = ParamConfig.BOOLEAN(DEFAULT.add_idn_attribute);
  }
}
const ParamsConfig2 = new ScatterSopParamsConfig();
export class ScatterSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "scatter";
  }
  static displayed_input_names() {
    return ["geometry to scatter points onto"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.NEVER);
  }
  async cook(input_contents) {
    this._operation = this._operation || new ScatterSopOperation(this.scene, this.states);
    const core_group = await this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}
