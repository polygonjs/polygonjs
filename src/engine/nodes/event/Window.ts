/**
 * Allows to trigger window events.
 *
 *
 */
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {ACCEPTED_WINDOW_EVENT_TYPES} from '../../scene/utils/events/WindowEventsController';
import {BaseNodeType} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from './_BaseInput';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventInputType} from '../../poly/registers/nodes/types/Event';
class WindowEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to allow any event to be listened to */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType) => {
			WindowEventNode.PARAM_CALLBACK_updateRegister(node as WindowEventNode);
		},
		separatorAfter: true,
	});
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(0, {
		hidden: true,
	});
	/** @param toggle on to listen to resize events */
	resize = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
}
const ParamsConfig = new WindowEventParamsConfig();

export class WindowEventNode extends TypedInputEventNode<WindowEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return EventInputType.WINDOW;
	}
	protected acceptedEventTypes() {
		return new Set(ACCEPTED_WINDOW_EVENT_TYPES.map((n) => `${n}`));
	}
	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints(
			ACCEPTED_WINDOW_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.POINTER);
			})
		);
	}
	override processEvent(eventContext: EventContext<Event>) {
		if (!this.pv.active) {
			return;
		}
		const event = eventContext.event;
		if (!event) {
			return;
		}
		this.dispatchEventToOutput(event.type, eventContext);
	}
}
