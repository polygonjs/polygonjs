import {TypedEventNode} from "./_Base";
const INPUT_START_NAME = "start";
const INPUT_END_NAME = "stop";
const OUTPUT_NAME = "tick";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
class TimerEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.period = ParamConfig.INTEGER(1e3);
    this.count = ParamConfig.INTEGER(-1);
  }
}
const ParamsConfig2 = new TimerEventParamsConfig();
export class TimerEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._timer_active = false;
    this._current_count = 0;
  }
  static type() {
    return "timer";
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint(INPUT_START_NAME, EventConnectionPointType.BASE, this._start_timer.bind(this)),
      new EventConnectionPoint(INPUT_END_NAME, EventConnectionPointType.BASE, this._stop_timer.bind(this))
    ]);
    this.io.outputs.set_named_output_connection_points([
      new EventConnectionPoint(OUTPUT_NAME, EventConnectionPointType.BASE)
    ]);
  }
  _start_timer(event_context) {
    if (!this._timer_active) {
      this._timer_active = true;
      this._current_count = 0;
    }
    this._run_timer(event_context);
  }
  _stop_timer() {
    this._timer_active = false;
  }
  _run_timer(event_context) {
    setTimeout(() => {
      if (this._timer_active) {
        if (this.pv.count <= 0 || this._current_count < this.pv.count) {
          this.dispatch_event_to_output(OUTPUT_NAME, event_context);
          this._current_count += 1;
          this._run_timer(event_context);
        } else {
          this._stop_timer();
        }
      }
    }, this.pv.period);
  }
}
