import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';

enum NullEventInput {
	TRIGGER = 'trigger',
}
enum NullEventOutput {
	OUT = 'out',
}

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class NullEventParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NullEventParamsConfig();

export class NullEventNode extends TypedEventNode<NullEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'null';
	}

	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(
				NullEventInput.TRIGGER,
				EventConnectionPointType.BASE,
				this.process_event_trigger.bind(this)
			),
		]);
		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(NullEventOutput.OUT, EventConnectionPointType.BASE),
		]);
	}

	process_event(event_context: EventContext<Event>) {}

	private process_event_trigger(event_context: EventContext<Event>) {
		this.dispatch_event_to_output(NullEventOutput.OUT, event_context);
	}
}
