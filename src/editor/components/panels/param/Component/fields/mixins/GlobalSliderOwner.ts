
import {MouseButton} from 'src/editor/core/MouseButton';

import { StoreController } from 'src/editor/store/controllers/StoreController';
export function SetupFolders() {

	function open_numeric_slider(e:MouseEvent){
			
		if (e.button === MouseButton.MIDDLE) {

			StoreController.editor.numeric_slider.open({
				param_id: (this.json_param != null ? this.json_param.graph_node_id : undefined),
				position: {x:e.clientX, y:e.clientY}
			})

			e.preventDefault();
		}
	} // to prevent paste into field

	function on_paste(e:Event){
		// to prevent paste into field
		const param_id = StoreController.editor.numeric_slider.param_id()
		if (param_id != null) {
			return e.preventDefault();
		}
	}

	return {
		open_numeric_slider,
		on_paste,
	}
}

	methods: {
		
	}
};



