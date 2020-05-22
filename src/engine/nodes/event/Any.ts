import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPointType} from '../utils/io/connections/Event';

const OUTPUT_NAME = 'event';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AnyEventParamsConfig extends NodeParamsConfig {
	inputs_count = ParamConfig.INTEGER(5, {
		range: [1, 10],
		range_locked: [true, false],
	});
}
const ParamsConfig = new AnyEventParamsConfig();

export class AnyEventNode extends TypedEventNode<AnyEventParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'any';
	}
	initialize_node() {
		// this.io.outputs.set_named_output_connection_points([
		// 	new EventConnectionPoint(OUTPUT_NAME, EventConnectionPointType.BASE),
		// ]);
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_input_name_function(this._input_name.bind(this));
		this.io.connection_points.set_output_name_function(() => OUTPUT_NAME);
		this.io.connection_points.set_expected_output_types_function(() => [EventConnectionPointType.BASE]);
	}
	private _expected_input_types() {
		const list: EventConnectionPointType[] = new Array(this.pv.inputs_count);
		list.fill(EventConnectionPointType.BASE);
		return list;
	}
	protected _input_name(index: number) {
		return `trigger${index}`;
	}

	process_event(event_context: EventContext<Event>) {
		this.dispatch_event_to_output(OUTPUT_NAME, event_context);
	}
}
