// import {BaseNodeSop} from 'src/Engine/Node/Sop/_Base'

export interface SetupInfosOptions {
	display_info: () => void;
	hide_info: () => void;
	display_node_info: Ref<boolean>;
}

import {ref, Ref} from '@vue/composition-api';
// import { EngineNodeData } from 'src/editor/store/modules/Engine';
export function SetupInfos(/*json_node: EngineNodeData*/): SetupInfosOptions {
	const display_node_info = ref(false);

	function display_info() {
		display_node_info.value = true;
	}
	function hide_info() {
		display_node_info.value = false;
	}
	// toggle_info_display(){
	// 	this.display_node_info = !this.display_node_info
	// },

	return {
		display_node_info,
		display_info,
		hide_info,
	};
}
