/**
 * Allows to trigger touch events.
 *
 *
 */
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {ACCEPTED_TOUCH_EVENT_TYPES} from '../../scene/utils/events/TouchEventsController';
import {BaseNodeType} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from './_BaseInput';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventInputType} from '../../poly/registers/nodes/types/Event';
import {CoreEventEmitter, EVENT_EMITTERS, EVENT_EMITTER_PARAM_MENU_OPTIONS} from '../../../core/event/CoreEventEmitter';
class TouchEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to allow any event to be listened to */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType) => {
			TouchEventNode.PARAM_CALLBACK_updateRegister(node as TouchEventNode);
		},
		separatorAfter: true,
	});
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		...EVENT_EMITTER_PARAM_MENU_OPTIONS,
		separatorAfter: true,
	});

	/** @param toggle on to listen to touchstart events */
	touchstart = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to touchmove events */
	touchmove = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to touchend events */
	touchend = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
}
const ParamsConfig = new TouchEventParamsConfig();

export class TouchEventNode extends TypedInputEventNode<TouchEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return EventInputType.TOUCH;
	}
	protected acceptedEventTypes() {
		return new Set(ACCEPTED_TOUCH_EVENT_TYPES.map((n) => `${n}`));
	}
	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints(
			ACCEPTED_TOUCH_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.DRAG);
			})
		);
	}
	override processEvent(eventContext: EventContext<TouchEvent>) {
		if (!this.pv.active) {
			return;
		}
		if (!eventContext.event) {
			return;
		}
		const event = eventContext.event;
		if (!event) {
			return;
		}
		this.dispatchEventToOutput(event.type, eventContext);
	}
}
