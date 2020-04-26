import {TypedEventNode} from './_Base';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {ACCEPTED_MOUSE_EVENT_TYPES} from '../../scene/utils/events/MouseEventsController';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {DispatcherRegisterer} from './utils/DispatcherRegisterer';

const event_param_options: ParamOptions = {
	visible_if: {active: 1},
	callback: (node: BaseNodeType, param: BaseParamType) => {
		MouseEventNode.PARAM_CALLBACK_update_register(node as MouseEventNode);
	},
};

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ParamOptions} from '../../params/utils/OptionsController';
class MouseEventParamsConfig extends NodeParamsConfig {
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			MouseEventNode.PARAM_CALLBACK_update_register(node as MouseEventNode);
		},
	});
	sep = ParamConfig.SEPARATOR();
	auxclick = ParamConfig.BOOLEAN(0, event_param_options);
	click = ParamConfig.BOOLEAN(0, event_param_options);
	contextmenu = ParamConfig.BOOLEAN(0, event_param_options);
	dblclick = ParamConfig.BOOLEAN(0, event_param_options);
	mousedown = ParamConfig.BOOLEAN(1, event_param_options);
	mouseenter = ParamConfig.BOOLEAN(0, event_param_options);
	mouseleave = ParamConfig.BOOLEAN(0, event_param_options);
	mousemove = ParamConfig.BOOLEAN(1, event_param_options);
	mouseover = ParamConfig.BOOLEAN(0, event_param_options);
	mouseout = ParamConfig.BOOLEAN(0, event_param_options);
	mouseup = ParamConfig.BOOLEAN(1, event_param_options);
	pointerlockchange = ParamConfig.BOOLEAN(0, event_param_options);
	pointerlockerror = ParamConfig.BOOLEAN(0, event_param_options);
	select = ParamConfig.BOOLEAN(0, event_param_options);
	wheel = ParamConfig.BOOLEAN(0, event_param_options);
}
const ParamsConfig = new MouseEventParamsConfig();

export class MouseEventNode extends TypedEventNode<MouseEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mouse';
	}
	private dispatcher_registerer = new DispatcherRegisterer(this);
	initialize_node() {
		this.io.outputs.set_named_output_connection_points(
			ACCEPTED_MOUSE_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.MOUSE);
			})
		);

		this.dispatcher_registerer.initialize();
	}

	process_event(event_context: EventContext<MouseEvent>) {
		if (!this.pv.active) {
			return;
		}
		if (!event_context.event) {
			return;
		}
		this.dispatch_event_to_output(event_context.event.type, event_context);
		// const index = this.io.outputs.get_output_index(event_context.event.type);
		// if (index >= 0) {
		// 	const connections = this.io.connections.output_connections();
		// 	const current_connections = connections.filter((connection) => connection.output_index == index);
		// 	const nodes: BaseEventNodeType[] = current_connections.map(
		// 		(connection) => connection.node_dest
		// 	) as BaseEventNodeType[];
		// 	for (let node of nodes) {
		// 		node.process_event(event_context);
		// 	}
		// }
	}

	static PARAM_CALLBACK_update_register(node: MouseEventNode) {
		node.dispatcher_registerer.update_register();
	}
}
