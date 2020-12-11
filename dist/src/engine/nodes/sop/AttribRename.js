import {TypedSopNode} from "./_Base";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {AttribClassMenuEntries, AttribClass} from "../../../core/geometry/Constant";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
class AttribRenameSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.class = ParamConfig.INTEGER(AttribClass.VERTEX, {
      menu: {
        entries: AttribClassMenuEntries
      }
    });
    this.old_name = ParamConfig.STRING();
    this.new_name = ParamConfig.STRING();
  }
}
const ParamsConfig2 = new AttribRenameSopParamsConfig();
export class AttribRenameSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "attrib_rename";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.old_name, this.p.new_name], () => {
          if (this.pv.old_name != "" && this.pv.new_name != "") {
            return `${this.pv.old_name} -> ${this.pv.new_name}`;
          } else {
            return "";
          }
        });
      });
    });
  }
  cook(input_contents) {
    const core_group = input_contents[0];
    core_group.rename_attrib(this.pv.old_name, this.pv.new_name, this.pv.class);
    this.set_core_group(core_group);
  }
}
