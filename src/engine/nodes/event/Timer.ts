import {TypedEventNode} from './_Base';

const INPUT_START_NAME = 'start';
const INPUT_END_NAME = 'stop';
const OUTPUT_NAME = 'on_completed';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
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
			new TypedNamedConnectionPoint(INPUT_START_NAME, ConnectionPointType.BOOL),
			new TypedNamedConnectionPoint(INPUT_END_NAME, ConnectionPointType.BOOL),
		]);
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME, ConnectionPointType.BOOL),
		]);
	}

	process_event() {
		console.log('timer start');
		this._start_timer();
	}

	private _timer_active = false;
	private _start_timer() {
		this._timer_active = true;
	}
	protected _stop_timer() {
		this._timer_active = false;
	}

	private _run_timer() {
		this.dispatch_event_to_output(OUTPUT_NAME, {});
		setTimeout(() => {
			if (this._timer_active) {
				this._run_timer();
			}
		}, this.pv.period);
	}
}
