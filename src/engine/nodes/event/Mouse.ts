/**
 * Allows to trigger mouse events.
 *
 *
 */
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {ACCEPTED_MOUSE_EVENT_TYPES} from '../../scene/utils/events/MouseEventsController';
import {BaseNodeType} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from './_BaseInput';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventInputType} from '../../poly/registers/nodes/types/Event';
import {CoreEventEmitter, EVENT_EMITTERS} from '../../../core/event/CoreEventEmitter';
class MouseEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to allow any event to be listened to */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType) => {
			MouseEventNode.PARAM_CALLBACK_updateRegister(node as MouseEventNode);
		},
		separatorAfter: true,
	});
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		menu: {
			entries: EVENT_EMITTERS.map((name, value) => {
				return {name, value};
			}),
		},
		separatorAfter: true,
	});
	/** @param toggle on to listen to auxclick events */
	auxclick = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to click events */
	click = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to contextmenu events */
	contextmenu = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to dblclick events */
	dblclick = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to mousedown events */
	mousedown = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to mouseenter events */
	mouseenter = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to mouseleave events */
	mouseleave = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to mousemove events */
	mousemove = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to mouseover events */
	mouseover = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to mouseout events */
	mouseout = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to mouseup events */
	mouseup = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to pointerlockchange events */
	pointerlockchange = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to pointerlockerror events */
	pointerlockerror = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to select events */
	select = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to wheel events */
	wheel = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param requires ctrlKey */
	ctrlKey = ParamConfig.BOOLEAN(0, {...EVENT_PARAM_OPTIONS, separatorBefore: true});
	/** @param requires altKey */
	altKey = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param requires shiftKey */
	shiftKey = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param requires metaKey */
	metaKey = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
}
const ParamsConfig = new MouseEventParamsConfig();

export class MouseEventNode extends TypedInputEventNode<MouseEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return EventInputType.MOUSE;
	}
	protected acceptedEventTypes() {
		return new Set(ACCEPTED_MOUSE_EVENT_TYPES.map((n) => `${n}`));
	}
	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints(
			ACCEPTED_MOUSE_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.MOUSE);
			})
		);
	}
	override processEvent(event_context: EventContext<MouseEvent>) {
		if (!this.pv.active) {
			return;
		}
		if (!event_context.event) {
			return;
		}
		const event = event_context.event;
		if (event.ctrlKey != isBooleanTrue(this.pv.ctrlKey)) {
			return;
		}
		if (event.shiftKey != isBooleanTrue(this.pv.shiftKey)) {
			return;
		}
		if (event.altKey != isBooleanTrue(this.pv.altKey)) {
			return;
		}
		if (event.metaKey != isBooleanTrue(this.pv.metaKey)) {
			return;
		}

		this.dispatchEventToOutput(event_context.event.type, event_context);
	}
}
