/**
 * Adds a delay to trigger received events
 *
 *
 *
 */
import {TypedEventNode} from './_Base';

const INPUT_NAME = 'in';
const OUTPUT_NAME = 'out';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
class TimerEventParamsConfig extends NodeParamsConfig {
	/** @param delay before dispatching */
	delay = ParamConfig.INTEGER(1000);
}
const ParamsConfig = new TimerEventParamsConfig();

export class DelayEventNode extends TypedEventNode<TimerEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'delay';
	}
	initializeNode() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(INPUT_NAME, EventConnectionPointType.BASE, this._process_input.bind(this)),
		]);
		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(OUTPUT_NAME, EventConnectionPointType.BASE),
		]);
	}

	private _process_input(event_context: EventContext<Event>) {
		setTimeout(() => {
			this.dispatch_event_to_output(OUTPUT_NAME, event_context);
		}, this.pv.delay);
	}
}
