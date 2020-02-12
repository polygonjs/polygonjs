import {computed} from '@vue/composition-api';
import {StoreController} from 'src/editor/store/controllers/StoreController';
import {EngineParamData} from 'src/editor/store/modules/Engine';
export function SetupSelectedNode() {
	const first_selected_node_id = computed(() => {
		const parent_node_id = StoreController.editor.current_node_graph_id();
		if (parent_node_id) {
			const parent_node_json = StoreController.engine.json_node(parent_node_id);
			if (parent_node_json && parent_node_json.selection) {
				return parent_node_json.selection[0];
			}
		}
		return null;
	});
	const first_selected_json_node = computed(() => {
		if (first_selected_node_id.value) {
			return StoreController.engine.json_node(first_selected_node_id.value);
		} else {
			return null;
		}
	});

	const selected_node_name = computed(() => {
		return first_selected_json_node.value?.name;
	});
	const selected_node_type = computed(() => {
		return first_selected_json_node.value?.type;
	});

	const selected_node_json_params_for_current_folder = computed(() => {
		const list: EngineParamData[] = [];
		if (first_selected_json_node.value) {
			for (let id of first_selected_json_node.value.param_ids) {
				const param_data = StoreController.engine.json_param(id);
				if (param_data) {
					list.push(param_data);
				} else {
					console.warn(`missing param in store for node ${first_selected_node()?.full_path()}`);
				}
			}
		}
		return list;
	});

	function first_selected_node() {
		const id = first_selected_node_id.value;
		if (id) {
			return StoreController.engine.node(id);
		}
		return null;
	}

	return {
		first_selected_node_id,
		first_selected_json_node,
		first_selected_node,
		selected_node_name,
		selected_node_type,
		selected_node_json_params_for_current_folder,
	};
}
