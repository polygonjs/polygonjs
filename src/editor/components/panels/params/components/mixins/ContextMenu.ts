import {StoreController} from 'src/editor/store/controllers/StoreController';
import {EngineParamData} from 'src/editor/store/modules/Engine';
import {BaseParamType} from 'src/engine/params/_Base';

export function SetupContextMenu(json_param: EngineParamData, param: BaseParamType) {
	function on_contextmenu(event: MouseEvent) {
		const menu_param_id = StoreController.editor.context_menu.param_id();
		const current_param_id = json_param.graph_node_id;
		if (menu_param_id == current_param_id) {
			on_contextmenu_close();
		} else {
			StoreController.editor.context_menu.set_param_id(current_param_id);
		}
		StoreController.editor.context_menu.set_position({
			x: event.pageX,
			y: event.pageY,
		});
	}
	function on_contextmenu_close() {
		StoreController.editor.context_menu.set_param_id(null);
	}

	return {
		on_contextmenu,
		on_contextmenu_close,
	};
}
