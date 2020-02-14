import {computed, Ref} from '@vue/composition-api';
import {StoreController} from 'src/editor/store/controllers/StoreController';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import {NodeSerializerData} from 'src/engine/nodes/utils/Serializer';

export interface SetupSelectedNodeOptions {
	first_selected_node_id: Readonly<Ref<string | null>>;
	first_selected_json_node: Readonly<Ref<Readonly<NodeSerializerData> | null>>;
	first_selected_node: () => BaseNodeType | null;
	selected_node_name: Readonly<Ref<string | undefined>>;
	selected_node_type: Readonly<Ref<string | undefined>>;
}

export function SetupSelectedNode(): SetupSelectedNodeOptions {
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
	};
}
