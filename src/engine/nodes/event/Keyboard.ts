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
	paramsConfig = ParamsConfig;
	static type() {
		return 'keyboard';
	}
	protected acceptedEventTypes() {
		return ACCEPTED_KEYBOARD_EVENT_TYPES.map((n) => `${n}`);
	}
	initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints(
			ACCEPTED_KEYBOARD_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.KEYBOARD);
			})
		);
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				const params: BaseParamType[] = [this.p.keydown, this.p.keypress, this.p.keyup];
				this.params.label.init(params.concat([this.p.keyCodes]), () => {
					const eventNames = params
						.map((p) => {
							return p.value ? p.name() : undefined;
						})
						.filter((v) => v)
						.join(', ');
					return `${eventNames} (${this.pv.keyCodes})`;
				});
			});
		});
	}
	processEvent(event_context: EventContext<KeyboardEvent>) {
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

		const requiredCodes = this.pv.keyCodes.trim();
		if (requiredCodes.length > 0) {
			const codes = this.pv.keyCodes.split(' ');
			if (!codes.includes(event.code)) {
				return;
			}
		}
		this.dispatchEventToOutput(event_context.event.type, event_context);
	}
}
