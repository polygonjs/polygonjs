import {TypedEventNode} from './_Base';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {ACCEPTED_MOUSE_EVENT_TYPES} from '../../scene/utils/events/MouseEventsController';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {DispatcherRegisterer} from './utils/DispatcherRegisterer';
class MouseEventParamsConfig extends NodeParamsConfig {
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			MouseEventNode.PARAM_CALLBACK_toggle_active(node as MouseEventNode);
		},
	});
}
const ParamsConfig = new MouseEventParamsConfig();

export class MouseEventNode extends TypedEventNode<MouseEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mouse_event';
	}
	private dispatcher_registerer = new DispatcherRegisterer(this);
	initialize_node() {
		// TODO: do not use GL connection Types here
		this.io.outputs.set_named_output_connection_points(
			ACCEPTED_MOUSE_EVENT_TYPES.map((event_type) => {
				return new TypedNamedConnectionPoint(event_type, ConnectionPointType.BOOL);
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

	static PARAM_CALLBACK_toggle_active(node: MouseEventNode) {
		node.dispatcher_registerer.update_register();
	}
}
