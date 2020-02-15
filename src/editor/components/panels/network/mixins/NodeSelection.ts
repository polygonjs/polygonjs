import {Vector2} from 'three/src/math/Vector2';
import {NodeSelectionHelper, NodeSelectionData} from '../helpers/NodeSelection';
import {StoreController} from 'src/editor/store/controllers/StoreController';

import {Ref, onMounted, computed, watch} from '@vue/composition-api';
export function SetupNodeSelection(
	node_selection_data: NodeSelectionData,
	node_selection_helper: NodeSelectionHelper,
	nodes_container: Ref<HTMLElement | null>
) {
	const current_node_graph_id = computed(() => StoreController.editor.current_node_graph_id());

	onMounted(() => {
		if (nodes_container.value) {
			node_selection_helper.set_element(nodes_container.value);
		}
		set_selection_helper_node();
	});
	watch(current_node_graph_id, (new_val, old_val) => {
		set_selection_helper_node();
	});

	const selection_rectangle_style_object = computed(() => {
		const box = node_selection_helper.box();
		const size = new Vector2();
		box.getSize(size);
		const display = node_selection_data.active ? 'block' : 'none';
		return {
			display: `${display}`,
			left: `${box.min.x}px`,
			top: `${box.min.y}px`,
			width: `${size.x}px`,
			height: `${size.y}px`,
		};
	});

	function set_selection_helper_node() {
		const node = StoreController.editor.current_node();
		if (node) {
			node_selection_helper.set_parent_node(node);
		}
	}

	return {selection_rectangle_style_object};
}
