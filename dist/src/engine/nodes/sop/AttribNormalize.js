import {TypedSopNode} from "./_Base";
import {
  AttribNormalizeSopOperation,
  NORMALIZE_MODES
} from "../../../core/operations/sop/AttribNormalize";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = AttribNormalizeSopOperation.DEFAULT_PARAMS;
class AttribNormalizeSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.mode = ParamConfig.INTEGER(DEFAULT.mode, {
      menu: {
        entries: NORMALIZE_MODES.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.name = ParamConfig.STRING(DEFAULT.name);
    this.change_name = ParamConfig.BOOLEAN(DEFAULT.change_name);
    this.new_name = ParamConfig.STRING(DEFAULT.new_name, {visible_if: {change_name: 1}});
  }
}
const ParamsConfig2 = new AttribNormalizeSopParamsConfig();
export class AttribNormalizeSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "attrib_normalize";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(AttribNormalizeSopOperation.INPUT_CLONED_STATE);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.name]);
      });
    });
  }
  set_mode(mode) {
    this.p.mode.set(NORMALIZE_MODES.indexOf(mode));
  }
  cook(input_contents) {
    this._operation = this._operation || new AttribNormalizeSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}
