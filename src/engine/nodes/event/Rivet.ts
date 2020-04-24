// import {TypedEventNode} from './_Base';
// import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
// import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
// import {BaseNodeType} from '../_Base';
// import {EventContext} from '../../scene/utils/events/_BaseEventsController';

// const OUTPUT_NAME = 'on_completed';

// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// class RivetEventParamsConfig extends NodeParamsConfig {
// 	cache = ParamConfig.BUTTON(null, {
// 		callback: (node: BaseNodeType) => {
// 			RivetEventNode.PARAM_CALLBACK_cache(node as RivetEventNode);
// 		},
// 	});
// }
// const ParamsConfig = new RivetEventParamsConfig();

// export class RivetEventNode extends TypedEventNode<RivetEventParamsConfig> {
// 	params_config = ParamsConfig;
// 	static type() {
// 		return 'rivet';
// 	}
// 	initialize_node() {
// 		// TODO: do not use GL connection Types here
// 		this.io.inputs.set_named_input_connection_points([
// 			new TypedNamedConnectionPoint('trigger', ConnectionPointType.BOOL),
// 		]);
// 		this.io.outputs.set_named_output_connection_points([
// 			new TypedNamedConnectionPoint(OUTPUT_NAME, ConnectionPointType.BOOL),
// 		]);
// 	}

// 	process_event(event_context: EventContext<Event>) {
// 		this.update();
// 	}

// 	static PARAM_CALLBACK_cache(node: RivetEventNode) {
// 		node.update();
// 	}
// 	private async update() {
// 		this.scene.rivets_register.update_rivet_transforms();
// 		this.dispatch_event_to_output(OUTPUT_NAME, {});
// 	}
// }
