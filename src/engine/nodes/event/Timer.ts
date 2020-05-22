import {TypedEventNode} from './_Base';

const INPUT_START_NAME = 'start';
const INPUT_END_NAME = 'stop';
const OUTPUT_NAME = 'tick';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
class TimerEventParamsConfig extends NodeParamsConfig {
	period = ParamConfig.INTEGER(1000);
}
const ParamsConfig = new TimerEventParamsConfig();

export class TimerEventNode extends TypedEventNode<TimerEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'timer';
	}
	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(INPUT_START_NAME, EventConnectionPointType.BASE, this._start_timer.bind(this)),
			new EventConnectionPoint(INPUT_END_NAME, EventConnectionPointType.BASE, this._stop_timer.bind(this)),
		]);
		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(OUTPUT_NAME, EventConnectionPointType.BASE),
		]);
	}

	private _timer_active = false;
	private _start_timer() {
		if (!this._timer_active) {
			this._timer_active = true;
			this._run_timer();
		}
	}
	protected _stop_timer() {
		this._timer_active = false;
	}

	private _run_timer() {
		setTimeout(() => {
			if (this._timer_active) {
				this.dispatch_event_to_output(OUTPUT_NAME, {});
				this._run_timer();
			}
		}, this.pv.period);
	}
}
