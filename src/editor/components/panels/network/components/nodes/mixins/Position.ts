import {computed} from '@vue/composition-api';
import {EngineNodeData} from 'src/editor/store/modules/Engine';
import {StoreController} from 'src/editor/store/controllers/StoreController';
export function SetupPosition(json_node: EngineNodeData) {
	// const node = StoreController.engine.node(json_node.graph_node_id);

	const position = computed(() => {
		return json_node.ui_data;
	});
	const is_being_moved = computed(() => {
		const state_by_node_ids = StoreController.editor.network.node_ids_being_moved();
		return state_by_node_ids[json_node.graph_node_id] || false;
		// const node_ids = this.$store.getters['editor/network/node_ids_being_moved'];
		// return lodash_includes(node_ids, this.node.graph_node_id());
	});

	return {
		position,
		is_being_moved,
	};
}
