/**
 * Allows to trigger keyboard events.
 *
 *
 */
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from './_BaseInput';
import {ACCEPTED_KEYBOARD_EVENT_TYPES} from '../../scene/utils/events/KeyboardEventsController';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {EVENT_EMITTERS, CoreEventEmitter} from '../../viewers/utils/EventsController';
import {CoreString} from '../../../core/String';
class KeyboardEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to allow any event to be listened to */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			KeyboardEventNode.PARAM_CALLBACK_updateRegister(node as KeyboardEventNode);
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
		...EVENT_PARAM_OPTIONS,
	});

	/** @param toggle on to listen to keydown events */
	keydown = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to keypress events */
	keypress = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to keyup events */
	keyup = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param space separated list of accepted key codes. If this is empty then any key is accepted. */
	keyCodes = ParamConfig.STRING('Digit1 KeyE ArrowDown', EVENT_PARAM_OPTIONS);
	/** @param requires ctrlKey */
	ctrlKey = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param requires altKey */
	altKey = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param requires shiftKey */
	shiftKey = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param requires metaKey */
	metaKey = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
}
const ParamsConfig = new KeyboardEventParamsConfig();

export class KeyboardEventNode extends TypedInputEventNode<KeyboardEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'keyboard';
	}
	protected acceptedEventTypes() {
		return new Set(ACCEPTED_KEYBOARD_EVENT_TYPES.map((n) => `${n}`));
	}
	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints(
			ACCEPTED_KEYBOARD_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.KEYBOARD);
			})
		);
	}
	setElement(element: CoreEventEmitter) {
		this.p.element.set(EVENT_EMITTERS.indexOf(element));
	}

	override processEvent(eventContext: EventContext<KeyboardEvent>) {
		if (!this.pv.active) {
			return;
		}
		if (!eventContext.event) {
			return;
		}
		const event = eventContext.event;
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

		if (!CoreString.matchMask(event.code, this.pv.keyCodes)) {
			return;
		}
		this.dispatchEventToOutput(eventContext.event.type, eventContext);
	}
}
