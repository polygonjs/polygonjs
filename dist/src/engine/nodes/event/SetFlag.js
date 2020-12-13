import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {TypedEventNode} from "./_Base";
import {TypeAssert} from "../../poly/Assert";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
var FlagUpdateMode;
(function(FlagUpdateMode2) {
  FlagUpdateMode2["SET"] = "set";
  FlagUpdateMode2["TOGGLE"] = "toggle";
})(FlagUpdateMode || (FlagUpdateMode = {}));
const FLAG_UPDATE_MODES = [FlagUpdateMode.SET, FlagUpdateMode.TOGGLE];
class SetFlagParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.mask = ParamConfig.STRING("/geo*", {});
    this.sep0 = ParamConfig.SEPARATOR();
    this.tdisplay = ParamConfig.BOOLEAN(0);
    this.display_mode = ParamConfig.INTEGER(FLAG_UPDATE_MODES.indexOf(FlagUpdateMode.SET), {
      visible_if: {tdisplay: 1},
      menu: {
        entries: FLAG_UPDATE_MODES.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.display = ParamConfig.BOOLEAN(0, {
      visible_if: {tdisplay: 1, display_mode: FLAG_UPDATE_MODES.indexOf(FlagUpdateMode.SET)}
    });
    this.sep1 = ParamConfig.SEPARATOR();
    this.tbypass = ParamConfig.BOOLEAN(0);
    this.bypass_mode = ParamConfig.INTEGER(FLAG_UPDATE_MODES.indexOf(FlagUpdateMode.SET), {
      visible_if: {tbypass: 1},
      menu: {
        entries: FLAG_UPDATE_MODES.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.bypass = ParamConfig.BOOLEAN(0, {
      visible_if: {tbypass: 1, display_mode: FLAG_UPDATE_MODES.indexOf(FlagUpdateMode.SET)}
    });
    this.execute = ParamConfig.BUTTON(null, {
      callback: (node) => {
        SetFlagEventNode.PARAM_CALLBACK_execute(node);
      }
    });
  }
}
const ParamsConfig2 = new SetFlagParamsConfig();
export class SetFlagEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "set_flag";
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint("trigger", EventConnectionPointType.BASE)
    ]);
  }
  async process_event(event_context) {
    let mask = this.pv.mask;
    if (event_context.value) {
      const node = event_context.value.node;
      if (node) {
        const parent = node.parent;
        if (parent) {
          mask = `${parent.full_path()}/${mask}`;
        }
      }
    }
    const nodes = this.scene.nodes_controller.nodes_from_mask(mask);
    for (let node of nodes) {
      this._update_node_flags(node);
    }
  }
  _update_node_flags(node) {
    this._update_node_display_flag(node);
    this._update_node_bypass_flag(node);
  }
  _update_node_display_flag(node) {
    if (!this.pv.tdisplay) {
      return;
    }
    if (!node.flags?.has_display()) {
      return;
    }
    const display_flag = node.flags.display;
    if (!display_flag) {
      return;
    }
    const mode = FLAG_UPDATE_MODES[this.pv.display_mode];
    switch (mode) {
      case FlagUpdateMode.SET: {
        display_flag.set(this.pv.display);
        return;
      }
      case FlagUpdateMode.TOGGLE: {
        display_flag.set(!display_flag.active);
        return;
      }
    }
    TypeAssert.unreachable(mode);
  }
  _update_node_bypass_flag(node) {
    if (!this.pv.tbypass) {
      return;
    }
    if (!node.flags?.has_bypass()) {
      return;
    }
    const bypass_flag = node.flags.bypass;
    if (!bypass_flag) {
      return;
    }
    const mode = FLAG_UPDATE_MODES[this.pv.bypass_mode];
    switch (mode) {
      case FlagUpdateMode.SET: {
        bypass_flag.set(this.pv.bypass);
        return;
      }
      case FlagUpdateMode.TOGGLE: {
        bypass_flag.set(!bypass_flag.active);
        return;
      }
    }
    TypeAssert.unreachable(mode);
  }
  static PARAM_CALLBACK_execute(node) {
    node.process_event({});
  }
}
