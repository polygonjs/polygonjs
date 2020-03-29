import {TypedEventNode, BaseEventNodeType} from './_Base';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {ACCEPTED_MOUSE_EVENT_TYPES} from '../../scene/utils/events/MouseEventsController';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
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
	initialize_node() {
		// TODO: do not use GL connection Types here
		this.io.outputs.set_named_output_connection_points(
			ACCEPTED_MOUSE_EVENT_TYPES.map((event_type) => {
				return new TypedNamedConnectionPoint(event_type, ConnectionPointType.BOOL);
			})
		);

		this.lifecycle.add_on_add_hook(() => {
			this.scene.events_controller.register_event_node(this);
		});
		this.lifecycle.add_delete_hook(() => {
			this.scene.events_controller.unregister_event_node(this);
		});
	}

	process_event(event: MouseEvent, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType) {
		if (!this.pv.active) {
			return;
		}
		const index = this.io.outputs.get_output_index(event.type);
		if (index >= 0) {
			const connections = this.io.connections.output_connections();
			const current_connections = connections.filter((connection) => connection.output_index == index);
			const nodes: BaseEventNodeType[] = current_connections.map(
				(connection) => connection.node_dest
			) as BaseEventNodeType[];
			for (let node of nodes) {
				node.process_event(event, canvas, camera_node);
			}
		}
	}

	_update_register() {
		if (this.pv.active) {
			this.scene.events_controller.register_event_node(this);
		} else {
			this.scene.events_controller.unregister_event_node(this);
		}
	}
	static PARAM_CALLBACK_toggle_active(node: MouseEventNode) {
		node._update_register();
	}
}
