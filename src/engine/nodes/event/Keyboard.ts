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
class KeyboardEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to allow any event to be listened to */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			KeyboardEventNode.PARAM_CALLBACK_update_register(node as KeyboardEventNode);
		},
	});
	sep = ParamConfig.SEPARATOR(null, {visibleIf: {active: true}});
	/** @param toggle on to listen to keydown events */
	keydown = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to keypress events */
	keypress = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to keyup events */
	keyup = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
}
const ParamsConfig = new KeyboardEventParamsConfig();

export class KeyboardEventNode extends TypedInputEventNode<KeyboardEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'keyboard';
	}
	protected accepted_event_types() {
		return ACCEPTED_KEYBOARD_EVENT_TYPES.map((n) => `${n}`);
	}
	initializeNode() {
		this.io.outputs.set_named_output_connection_points(
			ACCEPTED_KEYBOARD_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.KEYBOARD);
			})
		);
	}
}
