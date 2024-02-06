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
import {isBooleanTrue} from '../../../core/BooleanValue';
import {stringMatchMask} from '../../../core/String';
import {EventInputType} from '../../poly/registers/nodes/types/Event';
import {CoreEventEmitter, EVENT_EMITTERS} from '../../../core/event/CoreEventEmitter';
import {ACCEPTED_KEYBOARD_EVENT_TYPES} from '../../../core/event/KeyboardEventType';
import { EventContext } from '../../../core/event/EventContextType';
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
		return EventInputType.KEYBOARD;
	}
	protected acceptedEventTypes() {
		return new Set([...ACCEPTED_KEYBOARD_EVENT_TYPES]);
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
		const event = eventContext.event;
		if (!event) {
			return;
		}
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

		if (!stringMatchMask(event.code, this.pv.keyCodes)) {
			return;
		}
		this.dispatchEventToOutput(event.type, eventContext);
	}
}
