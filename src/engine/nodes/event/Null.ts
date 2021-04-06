/**
 * Simply triggers the events it receives
 *
 *
 */
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
	paramsConfig = ParamsConfig;
	static type() {
		return 'null';
	}

	initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(
				NullEventInput.TRIGGER,
				EventConnectionPointType.BASE,
				this.process_event_trigger.bind(this)
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(NullEventOutput.OUT, EventConnectionPointType.BASE),
		]);
	}

	processEvent(event_context: EventContext<Event>) {}

	private process_event_trigger(event_context: EventContext<Event>) {
		this.dispatchEventToOutput(NullEventOutput.OUT, event_context);
	}
}
