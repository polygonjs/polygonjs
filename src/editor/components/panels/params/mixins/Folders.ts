import {ref, onMounted, computed, watch, Ref} from '@vue/composition-api';
import {EngineParamData} from 'src/editor/store/modules/Engine';
import {StoreController} from 'src/editor/store/controllers/StoreController';
import {SetupSelectedNodeOptions} from '../../../../components/mixins/SelectedNode';
import {ParamType} from 'src/engine/poly/ParamType';
import {NodeSerializerData} from 'src/engine/nodes/utils/Serializer';
// import {FolderParam} from 'src/engine/params/Folder';

export function SetupFolders(selected_node_options: SetupSelectedNodeOptions) {
	const active_folder_param_id = ref<string | null>(null);
	const history_active_folder_id_by_param_graph_id: Map<string, string> = new Map<string, string>();

	const json_node: Ref<NodeSerializerData | null> = computed(() => {
		return selected_node_options.first_selected_json_node.value;
	});
	const json_params = computed(() => {
		if (json_node.value) {
			return json_node.value.param_ids.map((param_id) => StoreController.engine.json_param(param_id));
		} else {
			return [];
		}
	});
	const top_folder_json_params = computed(() => {
		return json_params.value.filter((json_param) => {
			if (json_param) {
				return _is_json_param_top_folder(json_param);
			}
		});
	});
	const display_top_folders = computed(() => {
		return top_folder_json_params.value.length > 0;
	});

	// const top_folder_names = computed(() => {
	// 	return top_folder_json_params.value.map((json_param) => {
	// 		if (json_param) {
	// 			return json_param.name;
	// 		}
	// 	});
	// });
	const NO_FOLDER_NAME = '';
	const param_ids_by_top_folder_ids = computed(() => {
		let last_folder_param_id: string = NO_FOLDER_NAME;
		const dict: Dictionary<string[]> = {};
		if (json_node.value) {
			const json_params = json_node.value.param_ids.map((param_id) =>
				StoreController.engine.json_param(param_id)
			);
			json_params.forEach((json_param) => {
				if (json_param) {
					if (_is_json_param_top_folder(json_param)) {
						last_folder_param_id = json_param.graph_node_id;
					} else {
						dict[last_folder_param_id] = dict[last_folder_param_id] || [];
						dict[last_folder_param_id].push(json_param.graph_node_id);
					}
				}
			});
		}
		return dict;
	});

	const folder_class_objects = computed(() => {
		return top_folder_json_params.value.map((json_param) => {
			return {
				active: active_folder_param_id.value == json_param?.graph_node_id,
			};
		});
	});
	function _is_json_param_top_folder(json_param: EngineParamData) {
		if (json_param.type == ParamType.FOLDER) {
			const param = StoreController.engine.param(json_param.graph_node_id);
			if (param) {
				if (param.options.level == 0) {
					return true;
				}
			}
		}
		return false;
	}
	// const selected_node_json_params_for_current_folder = computed(() => {
	// 	if (selected_node_json_params_by_folder_name) {
	// 		return selected_node_json_params_by_folder_name[active_folder_name] || [];
	// 	} else {
	// 		return [];
	// 	}
	// });
	// const param_tab_indices = computed(() => {
	// 	return selected_node_json_params_for_current_folder.map((p, i) => 1000 + i * 100);
	// });
	// const spare_param_tab_indices = computed(() => {
	// 	return selected_node_json_spare_params.map((p, i) => 2000 + i * 100);
	// });

	const selected_node_json_params_for_current_folder = computed(() => {
		if (json_node.value) {
			// check that params have been added to the store
			const first_id = json_node.value.param_ids[0];
			if (first_id) {
				const first_json_param = StoreController.engine.json_param(first_id);
				if (!first_json_param) {
					StoreController.engine.add_node_params_to_store(json_node.value.graph_node_id);
				}
			}

			// get the list
			let json_params: (EngineParamData | null)[] | undefined = undefined;
			if (active_folder_param_id.value) {
				const ids = param_ids_by_top_folder_ids.value[active_folder_param_id.value];
				if (ids) {
					json_params = ids.map((id) => StoreController.engine.json_param(id));
				}
			}
			if (!json_params) {
				json_params = json_node.value.param_ids.map((id) => StoreController.engine.json_param(id));
			}

			return json_params.filter((json_param) => {
				if (json_param) {
					const param = StoreController.engine.param(json_param.graph_node_id);
					return param && param.parent_param == null;
				}
			});
		} else {
			return [];
		}
	});

	onMounted(() => {
		// _selected_folder_by_node_id = _selected_folder_by_node_id || {};
		init_folder_name();
	});

	watch(selected_node_options.first_selected_node_id, (new_id, old_id) => {
		if (new_id) {
			init_folder_name();
		}
	});

	// // functions
	function init_folder_name() {
		if (json_node.value) {
			const node_id = json_node.value.graph_node_id;
			if (history_active_folder_id_by_param_graph_id.has(node_id)) {
				const folder_id = history_active_folder_id_by_param_graph_id.get(node_id);
				if (folder_id) {
					set_active_folder_id(folder_id);
				}
			} else {
				if (top_folder_json_params.value[0]) {
					set_active_folder_id(top_folder_json_params.value[0]?.graph_node_id);
				}
			}
		}
		// 	const folder_name = _selected_folder_by_node_id[selected_json_node.graph_node_id];
		// 	if (folder_name) {
		// 		set_active_folder(folder_name);
		// 	}
		// } else {
		// 	if (selected_node_folder_names.indexOf(active_folder_name) < 0) {
		// 		set_active_folder(selected_node_folder_names[0]);
		// 	}
		// }
	}
	function set_active_folder_id(folder_id: string) {
		active_folder_param_id.value = folder_id;

		if (json_node.value) {
			history_active_folder_id_by_param_graph_id.set(json_node.value.graph_node_id, folder_id);
		}
	}

	return {
		display_top_folders,
		top_folder_json_params,
		selected_node_json_params_for_current_folder,
		folder_class_objects,
		// functions
		set_active_folder_id,
	};
	// return {
	// 	active_folder_name,
	// 	folder_class_objects,
	// 	selected_node_json_params_for_current_folder,
	// 	param_tab_indices,
	// 	spare_param_tab_indices,
	// 	// functions
	// 	init_folder_name,
	// 	set_active_folder,
	// };
}
