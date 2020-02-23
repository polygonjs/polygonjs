import lodash_compact from 'lodash/compact';
import lodash_values from 'lodash/values';
import Vue from 'vue';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import {StoreController} from '../controllers/StoreController';
import {PolyScene} from 'src/engine/scene/PolyScene';

// import {SceneJsonExporterData} from 'src/engine/io/json/export/Scene';
import {NodeSerializerData} from 'src/engine/nodes/utils/Serializer';
import {ParamSerializerData} from 'src/engine/params/utils/Serializer';
// import {BaseParamType} from 'src/engine/params/_Base';

export type EngineNodeData = NodeSerializerData;
export type EngineParamData = ParamSerializerData;
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

export enum EngineMutation {
	// scene
	SCENE = 'SCENE',
	SCENE_FRAME_UPDATED = 'SCENE_FRAME_UPDATED',
	SCENE_FRAME_RANGE_UPDATED = 'SCENE_FRAME_RANGE_UPDATED',
	SCENE_PLAY_STATE_UPDATED = 'SCENE_PLAY_STATE_UPDATED',
	// node
	NODE_ADD_PARAMS_TO_STORE = 'NODE_ADD_PARAMS_TO_STORE',
	NODE_ERROR_UPDATED = 'NODE_ERROR_UPDATED',
	NODE_UI_DATA_POSITION_UPDATED = 'NODE_UI_DATA_POSITION_UPDATED',
	NODE_UI_DATA_COMMENT_UPDATED = 'NODE_UI_DATA_COMMENT_UPDATED',
	NODE_SELECTION_UPDATED = 'NODE_SELECTION_UPDATED',
	NODE_DISPLAY_FLAG_UPDATED = 'NODE_DISPLAY_FLAG_UPDATED',
	NODE_BYPASS_FLAG_UPDATED = 'NODE_BYPASS_FLAG_UPDATED',
	NODE_NAME_UPDATED = 'NODE_NAME_UPDATED',
	NODE_INPUTS_UPDATED = 'NODE_INPUTS_UPDATED',
	NODE_NAMED_INPUTS_UPDATED = 'NODE_NAMED_INPUTS_UPDATED',
	NODE_NAMED_OUTPUTS_UPDATED = 'NODE_NAMED_OUTPUTS_UPDATED',
	NODE_CREATED = 'NODE_CREATED',
	NODE_DELETED = 'NODE_DELETED',
	// param
	PARAM_RAW_INPUT_UPDATED = 'PARAM_RAW_INPUT_UPDATED',
	PARAM_VALUE_UPDATED = 'PARAM_VALUE_UPDATED',
	PARAM_EXPRESSION_UPDATED = 'PARAM_EXPRESSION_UPDATED',
	PARAM_ERROR_UPDATED = 'PARAM_ERROR_UPDATED',
	PARAM_VISIBLE_STATE = 'PARAM_VISIBLE_STATE',
}
type EnginePayloadByMutationMapGeneric = {[key in EngineMutation]: any};
export interface EnginePayloadByMutationMap extends EnginePayloadByMutationMapGeneric {
	// scene
	[EngineMutation.SCENE]: undefined;
	[EngineMutation.SCENE_FRAME_UPDATED]: undefined;
	[EngineMutation.SCENE_FRAME_RANGE_UPDATED]: undefined;
	[EngineMutation.SCENE_PLAY_STATE_UPDATED]: undefined;
	// node
	[EngineMutation.NODE_ADD_PARAMS_TO_STORE]: string;
	[EngineMutation.NODE_ERROR_UPDATED]: string;
	[EngineMutation.NODE_UI_DATA_POSITION_UPDATED]: string;
	[EngineMutation.NODE_UI_DATA_COMMENT_UPDATED]: string;
	[EngineMutation.NODE_SELECTION_UPDATED]: string;
	[EngineMutation.NODE_DISPLAY_FLAG_UPDATED]: string;
	[EngineMutation.NODE_BYPASS_FLAG_UPDATED]: string;
	[EngineMutation.NODE_NAME_UPDATED]: string;
	[EngineMutation.NODE_INPUTS_UPDATED]: string;
	[EngineMutation.NODE_CREATED]: {
		parent_id: string;
		child_node_json: EngineNodeData;
	};
	[EngineMutation.NODE_DELETED]: {
		parent_id: string;
		child_id: string;
	};
	// param
	[EngineMutation.PARAM_RAW_INPUT_UPDATED]: string;
	[EngineMutation.PARAM_VALUE_UPDATED]: string;
	[EngineMutation.PARAM_EXPRESSION_UPDATED]: string;
	[EngineMutation.PARAM_ERROR_UPDATED]: string;
	[EngineMutation.PARAM_VISIBLE_STATE]: string;
}

// actions payloads
// interface EnginePayloadUpdateChildren {
// 	json_node: EngineNodeData;
// 	children_ids: string[];
// }
interface EnginePayloadNodeEmitter {
	emitter: BaseNodeType;
}
// interface EnginePayloadParamEmitter {
// 	emitter: BaseParamType;
// }
// interface EnginePayloadNodeDeleted {
// 	emitter: BaseNodeType;
// 	data: {
// 		parent: BaseNodeType;
// 	};
// }
// interface EnginePayloadNodeCreated {
// 	emitter: BaseNodeType;
// 	data: {
// 		child_node: BaseNodeType;
// 	};
// }

const store_json_node = (state: EngineState, node: BaseNodeType) => state.nodes_by_graph_node_id[node.graph_node_id];
// window.store_json_param= (state, param)->
// 	state.params_by_graph_node_id[param.graph_node_id()]

function update_node_inputs_and_outputs(state: EngineState, node_id: string) {
	const node = StoreController.engine.node(node_id);
	if (node) {
		const json_node = store_json_node(state, node);
		if (json_node) {
			Vue.set(json_node, 'inputs', node.serializer.input_ids());
			Vue.set(json_node, 'input_connection_output_indices', node.serializer.connection_input_indices());
			Vue.set(json_node, 'named_input_connections', node.serializer.named_input_connections());
			Vue.set(json_node, 'named_output_connections', node.serializer.named_output_connections());
		}
	}
}

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
					const param_ids = json_node.param_ids;
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
		// 	return function(json_param:){
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
		// json_children_ids(state: EngineState, payload: EnginePayloadUpdateChildren) {
		// 	const json_node = payload['json_node'];
		// 	const children_ids = payload['children_ids'];
		// 	if (json_node) {
		// 		json_node['children'] = children_ids;
		// 	}
		// },

		//
		//
		// Scene Mutations
		//
		//
		[EngineMutation.SCENE]: function(state: EngineState) {
			const scene = StoreController.scene;
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
			Vue.set(state.frame_range, 0, scene.frame_range[0]);
			Vue.set(state.frame_range, 1, scene.frame_range[1]);
			Vue.set(state.frame_range_locked, 0, scene.time_controller.frame_range_locked[0]);
			Vue.set(state.frame_range_locked, 1, scene.time_controller.frame_range_locked[1]);
			state.fps = scene.time_controller.fps;
			state.scene_uuid = scene.uuid;
		},

		[EngineMutation.SCENE_FRAME_UPDATED]: function(state: EngineState) {
			state.frame = StoreController.scene.frame;
			// const scene_context = payload['emitter'];
			// return (state.frame = scene_context.frame());
		},
		[EngineMutation.SCENE_FRAME_RANGE_UPDATED]: function(state: EngineState) {
			const scene = StoreController.scene;
			Vue.set(state.frame_range, 0, scene.frame_range[0]);
			Vue.set(state.frame_range, 1, scene.frame_range[1]);
			Vue.set(state.frame_range_locked, 0, scene.time_controller.frame_range_locked[0]);
			Vue.set(state.frame_range_locked, 1, scene.time_controller.frame_range_locked[1]);
			state.fps = scene.time_controller.fps;
		},

		[EngineMutation.SCENE_PLAY_STATE_UPDATED]: function(state: EngineState) {
			const scene = StoreController.scene;
			// const scene_context = payload['emitter'];
			state.playing_state = scene.time_controller.playing;
		},

		//
		//
		// Node Mutations
		//
		//
		[EngineMutation.NODE_ADD_PARAMS_TO_STORE]: function(
			state: EngineState,
			node_id: EnginePayloadByMutationMap[EngineMutation.NODE_ADD_PARAMS_TO_STORE]
		) {
			const node = StoreController.engine.node(node_id);
			if (node) {
				for (let param of node.params.all) {
					if (!state.params_by_graph_node_id[param.graph_node_id]) {
						Vue.set(state.params_by_graph_node_id, param.graph_node_id, param.to_json());
						if (param.components) {
							for (let component of param.components) {
								Vue.set(state.params_by_graph_node_id, component.graph_node_id, component.to_json());
							}
						}
					}
				}
			}
		},

		[EngineMutation.NODE_UI_DATA_POSITION_UPDATED]: function(
			state: EngineState,
			node_id: EnginePayloadByMutationMap[EngineMutation.NODE_UI_DATA_POSITION_UPDATED]
		) {
			const node = StoreController.engine.node(node_id);
			if (node) {
				const json_node = store_json_node(state, node);
				if (json_node) {
					json_node.ui_data_json.x = node.ui_data.position.x;
					json_node.ui_data_json.y = node.ui_data.position.y;
				}
			}
		},
		[EngineMutation.NODE_UI_DATA_COMMENT_UPDATED]: function(
			state: EngineState,
			node_id: EnginePayloadByMutationMap[EngineMutation.NODE_UI_DATA_COMMENT_UPDATED]
		) {
			const node = StoreController.engine.node(node_id);
			if (node) {
				const json_node = store_json_node(state, node);
				if (json_node) {
					json_node.ui_data_json.comment = node.ui_data.comment;
				}
			}
		},

		[EngineMutation.NODE_SELECTION_UPDATED]: function(
			state: EngineState,
			node_id: EnginePayloadByMutationMap[EngineMutation.NODE_SELECTION_UPDATED]
		) {
			const node = StoreController.engine.node(node_id);
			if (node && node.children_allowed() && node.children_controller) {
				const json_node = store_json_node(state, node);
				if (json_node) {
					if (json_node.selection) {
						while (json_node.selection.pop()) {}
						const new_ids = node.children_controller.selection.to_json();
						for (let id of new_ids) {
							json_node.selection.push(id);
						}
					}
					// Vue.set(json_node, 'selection', node.children_controller.selection.to_json());
				}
			}
		},

		[EngineMutation.NODE_NAME_UPDATED]: function(
			state: EngineState,
			node_id: EnginePayloadByMutationMap[EngineMutation.NODE_NAME_UPDATED]
		) {
			const node = StoreController.engine.node(node_id);
			if (node) {
				const json_node = store_json_node(state, node);
				if (json_node) {
					json_node.name = node.name;
				}
			}
		},
		[EngineMutation.NODE_INPUTS_UPDATED]: function(
			state: EngineState,
			node_id: EnginePayloadByMutationMap[EngineMutation.NODE_INPUTS_UPDATED]
		) {
			update_node_inputs_and_outputs(state, node_id);
		},
		[EngineMutation.NODE_NAMED_INPUTS_UPDATED]: function(
			state: EngineState,
			node_id: EnginePayloadByMutationMap[EngineMutation.NODE_NAMED_INPUTS_UPDATED]
		) {
			update_node_inputs_and_outputs(state, node_id);
		},
		[EngineMutation.NODE_NAMED_OUTPUTS_UPDATED]: function(
			state: EngineState,
			node_id: EnginePayloadByMutationMap[EngineMutation.NODE_NAMED_OUTPUTS_UPDATED]
		) {
			update_node_inputs_and_outputs(state, node_id);
		},

		[EngineMutation.NODE_DISPLAY_FLAG_UPDATED](
			state: EngineState,
			node_id: EnginePayloadByMutationMap[EngineMutation.NODE_DISPLAY_FLAG_UPDATED]
		) {
			const node = StoreController.engine.node(node_id);
			if (node && node.flags?.display) {
				const json_node = store_json_node(state, node);
				if (json_node && json_node.flags?.display != null) {
					json_node.flags.display = node.flags.display.active;
				}
			}
		},

		[EngineMutation.NODE_BYPASS_FLAG_UPDATED](
			state: EngineState,
			node_id: EnginePayloadByMutationMap[EngineMutation.NODE_BYPASS_FLAG_UPDATED]
		) {
			const node = StoreController.engine.node(node_id);
			if (node && node.flags?.bypass) {
				const json_node = store_json_node(state, node);
				if (json_node && json_node.flags?.bypass != null) {
					json_node.flags.bypass = node.flags.bypass.active;
				}
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

		// node_inputs_updated(state: EngineState, payload: EnginePayloadNodeEmitter) {
		// 	const node = payload['emitter'];
		// 	const json_node = store_json_node(state, node);
		// 	if (json_node) {
		// 		const json = node.to_json();
		// 		json_node['inputs'] = json['inputs'];
		// 		json_node['input_connection_output_indices'] = json['input_connection_output_indices'];
		// 	}
		// },

		// node_named_inputs_updated(state: EngineState, payload: EnginePayloadNodeEmitter) {
		// 	const node = payload['emitter'];
		// 	const json_node = store_json_node(state, node);
		// 	if (json_node) {
		// 		const json = node.to_json();
		// 		json_node['named_input_connections'] = json['named_input_connections'];
		// 		json_node['named_input_connections'] = json['named_input_connections'];
		// 	}
		// },

		// node_named_outputs_updated(state: EngineState, payload: EnginePayloadNodeEmitter) {
		// 	const node = payload['emitter'];
		// 	const json_node = store_json_node(state, node);
		// 	if (json_node) {
		// 		const json = node.to_json();
		// 		json_node['named_output_connections'] = json['named_output_connections'];
		// 	}
		// },

		[EngineMutation.NODE_ERROR_UPDATED]: (
			state: EngineState,
			node_id: EnginePayloadByMutationMap[EngineMutation.NODE_ERROR_UPDATED]
		) => {
			const node = StoreController.engine.node(node_id);
			if (node) {
				const json_node = store_json_node(state, node);
				json_node['error_message'] = node.states.error.message;
			}
		},

		[EngineMutation.NODE_DELETED]: function(
			state: EngineState,
			payload: EnginePayloadByMutationMap[EngineMutation.NODE_DELETED]
		) {
			const parent_node_id = payload['parent_id'];
			const parent_data = state.nodes_by_graph_node_id[parent_node_id];
			if (parent_data) {
				const child_id = payload['child_id'];

				const index = parent_data.children.indexOf(child_id);
				parent_data.children.splice(index, 1);

				Vue.delete(state.nodes_by_graph_node_id, child_id);
			}
		},

		[EngineMutation.NODE_CREATED]: function(
			state: EngineState,
			payload: EnginePayloadByMutationMap[EngineMutation.NODE_CREATED]
		) {
			const parent_node_id = payload['parent_id'];
			const parent_node = StoreController.engine.node(parent_node_id);
			if (parent_node) {
				const child_node_json = payload['child_node_json'];

				Vue.set(state.nodes_by_graph_node_id, child_node_json.graph_node_id, child_node_json);
				const parent_data = state.nodes_by_graph_node_id[parent_node.graph_node_id];
				parent_data.children.push(child_node_json.graph_node_id);
			}
		},

		// node_dirty_updated: (state, payload)->
		// 	node = payload['emitter']

		// 	if node? && state.nodes_by_graph_node_id[node.graph_node_id()]?
		// 		state.nodes_by_graph_node_id[node.graph_node_id()].is_dirty = node.is_dirty()

		// [EngineMutation.PARAM_UPDATED](state: EngineState, payload: EnginePayloadNodeEmitter) {
		// 	// const node = payload['emitter'];
		// 	// console.log("store:param_updated", param.full_path())
		// 	// node.params.all.forEach((param) =>
		// 	// 	Vue.set(state.params_by_graph_node_id, param.graph_node_id, param.to_json())
		// 	// );
		// 	// const current = state.nodes_by_graph_node_id[node.graph_node_id];
		// 	// if (current != null) {
		// 	// 	Vue.set(current, 'params', node.serializer.to_json_params());
		// 	// 	Vue.set(current, 'spare_params', node.serializer.to_json_spare_params());
		// 	// }
		// },
		[EngineMutation.PARAM_RAW_INPUT_UPDATED](
			state: EngineState,
			param_id: EnginePayloadByMutationMap[EngineMutation.PARAM_RAW_INPUT_UPDATED]
		) {
			if (state.params_by_graph_node_id[param_id]) {
				const param = StoreController.engine.param(param_id);
				if (param) {
					Vue.set(state.params_by_graph_node_id[param_id], 'raw_input', param.serializer.raw_input());
				}
			}
		},
		[EngineMutation.PARAM_VALUE_UPDATED](
			state: EngineState,
			param_id: EnginePayloadByMutationMap[EngineMutation.PARAM_VALUE_UPDATED]
		) {
			if (state.params_by_graph_node_id[param_id]) {
				const param = StoreController.engine.param(param_id);
				if (param) {
					Vue.set(state.params_by_graph_node_id[param_id], 'value', param.serializer.value());
				}
			}
		},
		[EngineMutation.PARAM_EXPRESSION_UPDATED](
			state: EngineState,
			param_id: EnginePayloadByMutationMap[EngineMutation.PARAM_EXPRESSION_UPDATED]
		) {
			if (state.params_by_graph_node_id[param_id]) {
				const param = StoreController.engine.param(param_id);
				if (param) {
					Vue.set(state.params_by_graph_node_id[param_id], 'expression', param.serializer.expression());
				}
			}
		},
		[EngineMutation.PARAM_ERROR_UPDATED](
			state: EngineState,
			param_id: EnginePayloadByMutationMap[EngineMutation.PARAM_ERROR_UPDATED]
		) {
			if (state.params_by_graph_node_id[param_id]) {
				const param = StoreController.engine.param(param_id);
				if (param) {
					Vue.set(state.params_by_graph_node_id[param_id], 'error_message', param.serializer.error_message());
				}
			}
		},
		[EngineMutation.PARAM_VISIBLE_STATE](
			state: EngineState,
			param_id: EnginePayloadByMutationMap[EngineMutation.PARAM_VISIBLE_STATE]
		) {
			if (state.params_by_graph_node_id[param_id]) {
				const param = StoreController.engine.param(param_id);
				if (param) {
					state.params_by_graph_node_id[param_id].is_visible = param.serializer.is_visible();
				}
			}
		},
		// param_deleted(state: EngineState, payload: EnginePayloadParamEmitter) {
		// 	const param = payload['emitter'];
		// 	Vue.delete(state.params_by_graph_node_id, param.graph_node_id);
		// },

		// param_dirty_updated: (state, payload)->
		// 	param = payload['emitter']

		// 	if param? && state.params_by_graph_node_id[param.graph_node_id()]?
		// 		state.params_by_graph_node_id[param.graph_node_id()].is_dirty = param.is_dirty()

		// param_visible_updated(state: EngineState, payload: EnginePayloadParamEmitter) {
		// 	const param = payload['emitter'];

		// 	if (param && state.params_by_graph_node_id[param.graph_node_id]) {
		// 		state.params_by_graph_node_id[param.graph_node_id].is_visible = param.options.is_visible();
		// 	}
		// },
	},
};
