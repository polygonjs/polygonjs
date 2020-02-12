// import {watch, onMounted, ref, computed} from '@vue/composition-api';
export function SetupFolders() {
	// const active_folder_name = ref<string | null>(null);
	// onMounted(() => {
	// 	_selected_folder_by_node_id = _selected_folder_by_node_id || {};
	// 	init_folder_name();
	// });

	// watch(selected_graph_node_id, (new_id, old_id) => {
	// 	init_folder_name();
	// });

	// const folder_class_objects = computed(() => {
	// 	return selected_node_folder_names.map((folder_name) => {
	// 		return {
	// 			active: active_folder_name == folder_name,
	// 			label_hidden: selected_node_folder_names.length <= 1,
	// 		};
	// 	});
	// });
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

	// // functions
	// function init_folder_name() {
	// 	if (
	// 		selected_json_node &&
	// 		selected_json_node.graph_node_id &&
	// 		_selected_folder_by_node_id[selected_json_node.graph_node_id]
	// 	) {
	// 		const folder_name = _selected_folder_by_node_id[selected_json_node.graph_node_id];
	// 		if (folder_name) {
	// 			set_active_folder(folder_name);
	// 		}
	// 	} else {
	// 		if (selected_node_folder_names.indexOf(active_folder_name) < 0) {
	// 			set_active_folder(selected_node_folder_names[0]);
	// 		}
	// 	}
	// }
	// function set_active_folder(folder_name: string) {
	// 	active_folder_name.value = folder_name;

	// 	if (selected_json_node) {
	// 		_selected_folder_by_node_id[selected_json_node.graph_node_id] = folder_name;
	// 	}
	// }

	return {};
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
