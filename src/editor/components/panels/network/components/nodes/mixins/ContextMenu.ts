import {EngineNodeData} from 'src/editor/store/modules/Engine';
import {StoreController} from 'src/editor/store/controllers/StoreController';
export function SetupContextMenu(json_node: EngineNodeData) {
	function on_contextmenu(event: MouseEvent) {
		const menu_node_id = StoreController.editor.context_menu.node_id();
		const current_node_id = json_node.graph_node_id;
		if (menu_node_id == current_node_id) {
			on_contextmenu_close();
		} else {
			StoreController.editor.context_menu.set_node_id(current_node_id);
		}
		StoreController.editor.context_menu.set_position({
			x: event.pageX,
			y: event.pageY,
		});
	}
	function on_contextmenu_close() {
		StoreController.editor.context_menu.set_node_id(null);
	}

	return {
		on_contextmenu,
		on_contextmenu_close,
	};
}
