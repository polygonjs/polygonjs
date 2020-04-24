import {TypedEventNode} from './_Base';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {ACCEPTED_SCENE_EVENT_TYPES} from '../../scene/utils/events/SceneEventsController';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {DispatcherRegisterer} from './utils/DispatcherRegisterer';
class SceneEventParamsConfig extends NodeParamsConfig {
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			SceneEventNode.PARAM_CALLBACK_toggle_active(node as SceneEventNode);
		},
	});
}
const ParamsConfig = new SceneEventParamsConfig();

export class SceneEventNode extends TypedEventNode<SceneEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'scene_event';
	}
	private dispatcher_registerer = new DispatcherRegisterer(this);
	initialize_node() {
		// TODO: do not use GL connection Types here
		this.io.outputs.set_named_output_connection_points(
			ACCEPTED_SCENE_EVENT_TYPES.map((event_type) => {
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
	}

	static PARAM_CALLBACK_toggle_active(node: SceneEventNode) {
		node.dispatcher_registerer.update_register();
	}
}
