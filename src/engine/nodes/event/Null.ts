/**
 * Simply triggers the events it receives
 *
 *
 */
import {TypedEventNode} from './_Base';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';

enum NullEventInput {
	TRIGGER = 'trigger',
}
enum NullEventOutput {
	OUT = 'out',
}

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../../core/event/EventContextType';
class NullEventParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NullEventParamsConfig();

export class NullEventNode extends TypedEventNode<NullEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'null';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(
				NullEventInput.TRIGGER,
				EventConnectionPointType.BASE,
				this.processEventTrigger.bind(this)
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(NullEventOutput.OUT, EventConnectionPointType.BASE),
		]);
	}

	override processEvent(event_context: EventContext<Event>) {}

	private processEventTrigger(event_context: EventContext<Event>) {
		this.dispatchEventToOutput(NullEventOutput.OUT, event_context);
	}
}
