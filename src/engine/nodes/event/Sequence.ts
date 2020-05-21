import {TypedEventNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';

const INPUT_NAME = 'event';
const OUTPUTS_COUNT = 10;

class PassEventParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new PassEventParamsConfig();

export class SequenceEventNode extends TypedEventNode<PassEventParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'sequence';
	}
	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(INPUT_NAME, EventConnectionPointType.BASE),
		]);

		const list: EventConnectionPoint<EventConnectionPointType>[] = new Array(OUTPUTS_COUNT);
		for (let i = 0; i < OUTPUTS_COUNT; i++) {
			list[i] = new EventConnectionPoint(`trigger${i}`, EventConnectionPointType.BASE);
		}
		this.io.outputs.set_named_output_connection_points(list);
	}

	process_event(event_context: EventContext<Event>) {
		for (let i = 0; i < OUTPUTS_COUNT; i++) {
			const connection_point = this.io.outputs.named_output_connection_points[i];
			this.dispatch_event_to_output(connection_point.name, event_context);
		}
	}
}
