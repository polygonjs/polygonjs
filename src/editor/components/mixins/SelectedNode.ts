import {computed} from '@vue/composition-api';
import {StoreController} from 'src/editor/store/controllers/StoreController';
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
	};
}
