import {NodeCreationHelper} from '../helpers/NodeCreation';
import {Constants} from '../helpers/Constants';
import {StoreController} from 'src/editor/store/controllers/StoreController';

import {Ref, onMounted, computed, watch} from '@vue/composition-api';
export function SetupNodeCreation(nodes_container: Ref<HTMLElement | null>, node_creation_helper: NodeCreationHelper) {
	onMounted(() => {
		if (nodes_container.value) {
			node_creation_helper.set_element(nodes_container.value);
		}
		set_node_creation_helper_node();
	});

	const current_node_graph_id = computed(() => StoreController.editor.current_node_graph_id());

	const node_creation_rectangle_style_object = computed(() => {
		const active = node_creation_helper.active;
		if (active) {
			const size = Constants.NODE_UNIT;
			return {
				display: 'block',
				left: `${node_creation_helper.position.x}px`,
				top: `${node_creation_helper.position.y}px`,
				width: `${size}px`,
				height: `${size}px`,
			};
		} else {
			return {display: 'none'};
		}
	});

	watch(current_node_graph_id, (new_val, old_val) => {
		set_node_creation_helper_node();
	});

	function set_node_creation_helper_node() {
		const node = StoreController.editor.current_node();
		node_creation_helper.set_parent_node(node);
	}

	return {node_creation_rectangle_style_object};
}
