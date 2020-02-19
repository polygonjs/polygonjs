import {EngineNodeData} from 'src/editor/store/modules/Engine';
// import {StoreController} from 'src/editor/store/controllers/StoreController';
import {computed} from '@vue/composition-api';
export function SetupIcon(json_node: EngineNodeData) {
	// const node = StoreController.engine.node(json_node.graph_node_id);

	const icon = computed(() => {
		// TODO: it could make the engine lighter if refs to the icons were in the editor only
		return null; //node?.ui_data.icon();
	});
	const display_icon = computed(() => {
		return icon.value != null;
	});

	return {
		icon,
		display_icon,
	};
}
