import {computed, Ref} from '@vue/composition-api';
import {EngineNodeData} from 'src/editor/store/modules/Engine';
export function SetupSelection(json_node: EngineNodeData, json_parent: EngineNodeData) {
	// const json_selection = computed(()=>{
	// 	return json_parent.selection
	// })
	const is_selected: Readonly<Ref<boolean>> = computed(() => {
		if (json_parent.selection) {
			const res: boolean = json_parent.selection.includes(json_node.graph_node_id);
			return res;
		} else {
			return false;
		}
	});

	return {
		is_selected,
	};
}
