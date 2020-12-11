import {TypedSopNode} from "./_Base";
import {AttribCopySopOperation} from "../../../core/operations/sop/AttribCopy";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = AttribCopySopOperation.DEFAULT_PARAMS;
class AttribCopySopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.name = ParamConfig.STRING(DEFAULT.name);
    this.tnew_name = ParamConfig.BOOLEAN(DEFAULT.tnew_name);
    this.new_name = ParamConfig.STRING(DEFAULT.new_name, {visible_if: {tnew_name: 1}});
    this.src_offset = ParamConfig.INTEGER(DEFAULT.src_offset, {
      range: [0, 3],
      range_locked: [true, true]
    });
    this.dest_offset = ParamConfig.INTEGER(DEFAULT.dest_offset, {
      range: [0, 3],
      range_locked: [true, true]
    });
  }
}
const ParamsConfig2 = new AttribCopySopParamsConfig();
export class AttribCopySopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "attrib_copy";
  }
  static displayed_input_names() {
    return ["geometry to copy attributes to", "geometry to copy attributes from"];
  }
  initialize_node() {
    this.io.inputs.set_count(2);
    this.io.inputs.init_inputs_cloned_state(AttribCopySopOperation.INPUT_CLONED_STATE);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.name, this.p.tnew_name, this.p.new_name], () => {
          return this.pv.tnew_name ? `${this.pv.name} -> ${this.pv.new_name}` : this.pv.name;
        });
      });
    });
  }
  cook(input_contents) {
    this._operation = this._operation || new AttribCopySopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}
