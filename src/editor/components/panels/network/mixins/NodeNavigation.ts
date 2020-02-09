import {StoreController} from 'src/editor/store/controllers/StoreController';

import {computed} from '@vue/composition-api';
export function SetupNodeNavigation() {
	const current_node_graph_id = computed(() => StoreController.editor.current_node_graph_id());
	const display_go_up_button = computed(() => {
		if (current_node_graph_id) {
			return StoreController.editor.current_node() && StoreController.editor.current_node().parent != null;
		}
		return false;
	});

	function go_up() {
		StoreController.editor.go_up();
	}

	return {
		display_go_up_button,
		go_up,
	};
}
