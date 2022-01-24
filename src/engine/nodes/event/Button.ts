/**
 * Displays a button to send a trigger
 *
 * @remarks
 * This is useful when you want to manually test a series of events
 *
 */
import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';

enum ButtonEventOutput {
	OUT = 'out',
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class ButtonEventParamsConfig extends NodeParamsConfig {
	/** @param button to presse to trigger the event */
	dispatch = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			ButtonEventNode.PARAM_CALLBACK_execute(node as ButtonEventNode);
		},
	});
}
const ParamsConfig = new ButtonEventParamsConfig();

export class ButtonEventNode extends TypedEventNode<ButtonEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'button';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(ButtonEventOutput.OUT, EventConnectionPointType.BASE),
		]);
	}

	override processEvent(event_context: EventContext<Event>) {}

	private process_event_execute(event_context: EventContext<Event>) {
		this.dispatchEventToOutput(ButtonEventOutput.OUT, event_context);
	}

	static PARAM_CALLBACK_execute(node: ButtonEventNode) {
		node.process_event_execute({});
	}
}
