/**
 * Timer to trigger events at certain intervals
 *
 *
 *
 */
import {TypedEventNode} from './_Base';

const INPUT_START_NAME = 'start';
const INPUT_END_NAME = 'stop';
const OUTPUT_NAME = 'tick';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
class TimerEventParamsConfig extends NodeParamsConfig {
	/** @param period between each interval */
	period = ParamConfig.INTEGER(1000);
	/** @param number of times the timer should repeat. Set to -1 to never stop */
	count = ParamConfig.INTEGER(-1);
}
const ParamsConfig = new TimerEventParamsConfig();

export class TimerEventNode extends TypedEventNode<TimerEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'timer';
	}
	initializeNode() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(INPUT_START_NAME, EventConnectionPointType.BASE, this._start_timer.bind(this)),
			new EventConnectionPoint(INPUT_END_NAME, EventConnectionPointType.BASE, this._stop_timer.bind(this)),
		]);
		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(OUTPUT_NAME, EventConnectionPointType.BASE),
		]);
	}

	private _timer_active = false;
	private _current_count = 0;
	private _start_timer(event_context: EventContext<Event>) {
		if (!this._timer_active) {
			this._timer_active = true;
			this._current_count = 0;
		}
		// TODO: this needs to be more robust.
		// Currently if the timer has a period of 1 second,
		// with a count of 1, and is started twice, 500ms after one another,
		// only a single instance will be fired. Unless _run_timer() is out of the if block above.
		// But then it could be started too many times
		this._run_timer(event_context);
	}
	protected _stop_timer() {
		this._timer_active = false;
	}

	private _run_timer(event_context: EventContext<Event>) {
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
