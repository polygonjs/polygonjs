import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {ACCEPTED_MOUSE_EVENT_TYPES} from '../../scene/utils/events/MouseEventsController';
import {BaseNodeType} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from './_BaseInput';
class MouseEventParamsConfig extends NodeParamsConfig {
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType) => {
			MouseEventNode.PARAM_CALLBACK_update_register(node as MouseEventNode);
		},
	});
	sep = ParamConfig.SEPARATOR(null, {visible_if: {active: true}});
	auxclick = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	click = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	contextmenu = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	dblclick = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	mousedown = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	mouseenter = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	mouseleave = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	mousemove = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	mouseover = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	mouseout = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	mouseup = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	pointerlockchange = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	pointerlockerror = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	select = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
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
