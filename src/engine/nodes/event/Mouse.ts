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
class MouseEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to allow any event to be listened to */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType) => {
			MouseEventNode.PARAM_CALLBACK_update_register(node as MouseEventNode);
		},
	});
	sep = ParamConfig.SEPARATOR(null, {visibleIf: {active: true}});
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
}
const ParamsConfig = new MouseEventParamsConfig();

export class MouseEventNode extends TypedInputEventNode<MouseEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mouse';
	}
	protected accepted_event_types() {
		return ACCEPTED_MOUSE_EVENT_TYPES.map((n) => `${n}`);
	}
	initialize_node() {
		this.io.outputs.set_named_output_connection_points(
			ACCEPTED_MOUSE_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.MOUSE);
			})
		);
	}
}
