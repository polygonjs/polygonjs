import lodash_indexOf from 'lodash/indexOf';
import lodash_compact from 'lodash/compact';
import lodash_values from 'lodash/values';
import Vue from 'vue';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import {StoreController} from '../StoreController';
import {PolyScene} from 'src/engine/scene/PolyScene';

// import {SceneJsonExporterData} from 'src/engine/io/json/export/Scene';
import {NodeSerializerData} from 'src/engine/nodes/utils/Serializer';
import {ParamSerializerData} from 'src/engine/params/utils/Serializer';
import {BaseParamType} from 'src/engine/params/_Base';

type EngineNodeData = NodeSerializerData;
type EngineParamData = ParamSerializerData;
export interface EngineState {
	scene_uuid: string | undefined;
	nodes_by_graph_node_id: Dictionary<EngineNodeData>;
	params_by_graph_node_id: Dictionary<EngineParamData>;
	frame: number;
	frame_range: Number2;
	frame_range_locked: Boolean2;
	fps: number;
	playing_state: boolean;
}

// actions payloads
interface EnginePayloadUpdateChildren {
	json_node: EngineNodeData;
	children_ids: string[];
}
interface EnginePayloadNodeEmitter {
	emitter: BaseNodeType;
}
interface EnginePayloadParamEmitter {
	emitter: BaseParamType;
}
interface EnginePayloadNodeDeleted {
	emitter: BaseNodeType;
	data: {
		parent: BaseNodeType;
	};
}
interface EnginePayloadNodeCreated {
	emitter: BaseNodeType;
	data: {
		child_node: BaseNodeType;
	};
}

const store_json_node = (state: EngineState, node: BaseNodeType) => state.nodes_by_graph_node_id[node.graph_node_id];
// window.store_json_param= (state, param)->
// 	state.params_by_graph_node_id[param.graph_node_id()]

export const EngineStoreModule = {
	namespaced: true,
	state(): EngineState {
		return {
			scene_uuid: undefined,
			nodes_by_graph_node_id: {},
			params_by_graph_node_id: {},
			frame: 0,
			frame_range: [0, 10],
			frame_range_locked: [true, true],
			fps: 30,
			playing_state: false,
		};
	},

	getters: {
		frame(state: EngineState) {
			return state.frame;
		},
		frame_range(state: EngineState) {
			return state.frame_range;
		},
		frame_range_locked(state: EngineState) {
			return state.frame_range_locked;
		},
		fps(state: EngineState) {
			return state.fps;
		},
		playing_state(state: EngineState) {
			return state.playing_state;
		},
		json_node(state: EngineState) {
			return (graph_node_id: string) => state.nodes_by_graph_node_id[graph_node_id];
		},
		json_param(state: EngineState) {
			return (graph_node_id: string) => state.params_by_graph_node_id[graph_node_id];
		},
		json_nodes_by_name(state: EngineState) {
			return (node_name: string) =>
				lodash_values(state.nodes_by_graph_node_id).filter((json_node) => json_node.name === node_name);
		},

		json_root(state: EngineState) {
			const scene: PolyScene = StoreController.scene;
			const id = scene.root.graph_node_id;
			return state.nodes_by_graph_node_id[id];
		},

		json_children(state: EngineState) {
			return function(json_node: EngineNodeData) {
				if (json_node) {
					const children_ids = json_node.children;
					const children = children_ids.map((children_id) => state.nodes_by_graph_node_id[children_id]);

					// check if any resolves to null
					const compacted_children = lodash_compact(children);
					if (compacted_children.length !== children.length) {
						console.warn('some children resolved to null in engine/json_children!', children);
					}
					// updated_children_ids = lodash_map( compacted_children, (child)->child.graph_node_id )
					// POLY.store.commit 'engine/json_children_ids',
					// 	json_node: json_node
					// 	children_ids: updated_children_ids

					return compacted_children;
				} else {
					return [];
				}
			};
		},
		json_params(state: EngineState) {
			return function(json_node: EngineNodeData) {
				if (json_node) {
					const param_ids = json_node.params;
					const params_data: ParamSerializerData[] = [];
					for (let param_id of Object.keys(param_ids)) {
						const param_data = state.params_by_graph_node_id[param_id];
						if (param_data) {
							params_data.push(param_data);
						}
					}
					return params_data;
				} else {
					return [];
				}
			};
		},
		// json_spare_params(state:EngineState){
		// 	return function(json_node:EngineNodeData){
		// 		if (json_node != null) {
		// 			let json_params;
		// 			const param_ids = json_node.spare_params;
		// 			return json_params = lodash_map(param_ids, param_id=> state.params_by_graph_node_id[param_id]);
		// 		} else {
		// 			return [];
		// 		}
		// 	};
		// },
		// json_param_components(state:EngineState){
		// 	return function(json_param){
		// 		if (json_param != null) {
		// 			let json_params;
		// 			const param_ids = json_param.components;
		// 			return json_params = lodash_map(param_ids, param_id=> state.params_by_graph_node_id[param_id]);
		// 		} else {
		// 			return [];
		// 		}
		// 	};
		// }
	},

	// TODO:
	// on_node_create
	// on_param_create (for spare param?)
	mutations: {
		json_children_ids(state: EngineState, payload: EnginePayloadUpdateChildren) {
			const json_node = payload['json_node'];
			const children_ids = payload['children_ids'];
			if (json_node) {
				json_node['children'] = children_ids;
			}
		},

		scene(state: EngineState, scene: PolyScene) {
			const include_node_param_components = false;
			const nodes_by_graph_node_id: Dictionary<EngineNodeData> = {};
			// for (let node of scene.nodes_controller.all_nodes()) {
			// 	nodes_by_graph_node_id[node.graph_node_id] = node.to_json(include_node_param_components);

			// 	const params = node.params.all; //lodash_compact(lodash_concat( lodash_values(node.params()), lodash_values(node.spare_params()) ));
			// 	for (let param of params) {
			// 		params_by_graph_node_id[param.graph_node_id] = param.to_json();
			// 	}
			// }
			for (let node of scene.nodes_controller.all_nodes()) {
				nodes_by_graph_node_id[node.graph_node_id] = node.to_json(include_node_param_components);
			}

			state.nodes_by_graph_node_id = nodes_by_graph_node_id;
			state.params_by_graph_node_id = {}; //json.params_by_graph_node_id;
			state.frame = scene.frame;
			state.frame_range = scene.frame_range;
			state.frame_range_locked = scene.time_controller.frame_range_locked;
			state.fps = scene.time_controller.fps;
			state.scene_uuid = scene.uuid;
		},

		scene_frame_updated(state: EngineState, payload: number) {
			state.frame = payload;
			// const scene_context = payload['emitter'];
			// return (state.frame = scene_context.frame());
		},
		scene_frame_range_updated(state: EngineState, payload: PolyScene) {
			const scene = payload;
			state.frame_range = scene.frame_range;
			state.frame_range_locked = scene.time_controller.frame_range_locked;
			state.fps = scene.time_controller.fps;
		},

		scene_play_state_updated(state: EngineState, payload: PolyScene) {
			const scene = payload;
			// const scene_context = payload['emitter'];
			state.playing_state = scene.time_controller.playing;
		},

		ui_data_updated(state: EngineState, payload: EnginePayloadNodeEmitter) {
			const node = payload['emitter'];
			// const data = payload['data'];
			const json_node = store_json_node(state, node);
			if (json_node) {
				json_node['ui_data'] = node.ui_data.to_json();
			}
		},

		selection_update(state: EngineState, payload: EnginePayloadNodeEmitter) {
			const node = payload['emitter'];
			const json_node = store_json_node(state, node);
			if (json_node) {
				json_node['selection'] = node.selection.to_json();
			}
		},

		node_name_update(state: EngineState, payload: EnginePayloadNodeEmitter) {
			const node = payload['emitter'];

			const json_node = store_json_node(state, node);
			if (json_node) {
				json_node.name = node.name;
			}
		},

		display_flag_update(state: EngineState, payload: EnginePayloadNodeEmitter) {
			const node = payload['emitter'];
			const json_node = store_json_node(state, node);
			if (json_node && json_node.flags) {
				json_node.flags['display'] = node.flags?.display?.active;
			}
		},

		bypass_flag_update(state: EngineState, payload: EnginePayloadNodeEmitter) {
			const node = payload['emitter'];
			const json_node = store_json_node(state, node);
			if (json_node && json_node.flags) {
				json_node.flags['bypass'] = node.flags?.bypass?.active;
			}
		},

		override_clonable_state_update(state: EngineState, payload: EnginePayloadNodeEmitter) {
			const node = payload['emitter'];
			const json_node = store_json_node(state, node);
			if (json_node) {
				json_node.override_clonable_state = node.io.inputs.override_clonable_state();
				json_node.inputs_clonable_state_with_override = node.io.inputs.inputs_clonable_state_with_override();
			}
		},

		node_inputs_updated(state: EngineState, payload: EnginePayloadNodeEmitter) {
			const node = payload['emitter'];
			const json_node = store_json_node(state, node);
			if (json_node) {
				const json = node.to_json();
				json_node['inputs'] = json['inputs'];
				json_node['input_connection_output_indices'] = json['input_connection_output_indices'];
			}
		},

		node_named_inputs_updated(state: EngineState, payload: EnginePayloadNodeEmitter) {
			const node = payload['emitter'];
			const json_node = store_json_node(state, node);
			if (json_node) {
				const json = node.to_json();
				json_node['named_inputs'] = json['named_inputs'];
			}
		},

		node_named_outputs_updated(state: EngineState, payload: EnginePayloadNodeEmitter) {
			const node = payload['emitter'];
			const json_node = store_json_node(state, node);
			if (json_node) {
				const json = node.to_json();
				json_node['named_outputs'] = json['named_outputs'];
			}
		},

		node_error_updated(state: EngineState, payload: EnginePayloadNodeEmitter) {
			const node = payload['emitter'];
			const json_node = store_json_node(state, node);
			if (json_node) {
				json_node['error_message'] = node.states.error.message;
			}
		},

		node_deleted(state: EngineState, payload: EnginePayloadNodeDeleted) {
			const node = payload['emitter'];
			const parent = payload['data']['parent'];
			Vue.delete(state.nodes_by_graph_node_id, node.graph_node_id);

			// remove params
			// lodash_each(node.params.all, (param) => Vue.delete(state.params_by_graph_node_id, param.graph_node_id));

			// reset children of parent
			const children_ids = state.nodes_by_graph_node_id[parent.graph_node_id]['children'];
			const index = lodash_indexOf(children_ids, node.graph_node_id);
			children_ids.splice(index, 1);
		},

		node_created(state: EngineState, payload: EnginePayloadNodeCreated) {
			const parent_node = payload['emitter'];
			const data = payload['data'];
			const child_node = data['child_node'];
			Vue.set(state.nodes_by_graph_node_id, parent_node.graph_node_id, parent_node.to_json());
			Vue.set(state.nodes_by_graph_node_id, child_node.graph_node_id, child_node.to_json());

			// child_node.params.all.forEach((param) =>
			// 	Vue.set(state.params_by_graph_node_id, param.graph_node_id, param.to_json())
			// );
		},

		// node_dirty_updated: (state, payload)->
		// 	node = payload['emitter']

		// 	if node? && state.nodes_by_graph_node_id[node.graph_node_id()]?
		// 		state.nodes_by_graph_node_id[node.graph_node_id()].is_dirty = node.is_dirty()

		params_updated(state: EngineState, payload: EnginePayloadNodeEmitter) {
			// const node = payload['emitter'];
			// console.log("store:param_updated", param.full_path())
			// node.params.all.forEach((param) =>
			// 	Vue.set(state.params_by_graph_node_id, param.graph_node_id, param.to_json())
			// );
			// const current = state.nodes_by_graph_node_id[node.graph_node_id];
			// if (current != null) {
			// 	Vue.set(current, 'params', node.serializer.to_json_params());
			// 	Vue.set(current, 'spare_params', node.serializer.to_json_spare_params());
			// }
		},

		param_updated(state: EngineState, payload: EnginePayloadParamEmitter) {
			const param = payload['emitter'];
			// console.log("store:param_updated", param.full_path())
			Vue.set(state.params_by_graph_node_id, param.graph_node_id, param.to_json());
		},
		param_deleted(state: EngineState, payload: EnginePayloadParamEmitter) {
			const param = payload['emitter'];
			Vue.delete(state.params_by_graph_node_id, param.graph_node_id);
		},

		// param_dirty_updated: (state, payload)->
		// 	param = payload['emitter']

		// 	if param? && state.params_by_graph_node_id[param.graph_node_id()]?
		// 		state.params_by_graph_node_id[param.graph_node_id()].is_dirty = param.is_dirty()

		param_visible_updated(state: EngineState, payload: EnginePayloadParamEmitter) {
			const param = payload['emitter'];

			if (param && state.params_by_graph_node_id[param.graph_node_id]) {
				state.params_by_graph_node_id[param.graph_node_id].is_visible = param.options.is_visible();
			}
		},
	},
};
