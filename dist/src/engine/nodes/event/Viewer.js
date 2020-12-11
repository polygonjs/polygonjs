import {TypedEventNode} from "./_Base";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class ViewerParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.class_name = ParamConfig.STRING("active");
  }
}
const ParamsConfig2 = new ViewerParamsConfig();
export class ViewerEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "viewer";
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint("set", EventConnectionPointType.BASE, this._process_trigger_set.bind(this)),
      new EventConnectionPoint("unset", EventConnectionPointType.BASE, this._process_trigger_unset.bind(this))
    ]);
  }
  _process_trigger_set(context) {
    const canvas = context.canvas;
    if (canvas) {
      canvas.classList.add(this.pv.class_name);
    }
  }
  _process_trigger_unset(context) {
    const canvas = context.canvas;
    if (canvas) {
      canvas.classList.remove(this.pv.class_name);
    }
  }
}
