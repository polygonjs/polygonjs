import {EngineNodeData} from 'src/editor/store/modules/Engine';
import {StoreController} from 'src/editor/store/controllers/StoreController';

import {computed, Ref} from '@vue/composition-api';
export function SetupChildrenOwner(
	json_node: EngineNodeData,
	body_size: Readonly<
		Ref<
			Readonly<{
				x: number;
				y: number;
			}>
		>
	>,
	layout_vertical: Readonly<Ref<boolean>>
) {
	const node = StoreController.engine.node(json_node.graph_node_id);

	const children_allowed = computed(() => {
		return node?.children_allowed() || false;
	});
	const enter_button_container_style_object = computed(() => {
		if (layout_vertical.value) {
			return {
				right: `${0.5 * body_size.value.x}px`,
				top: `${0.0 * body_size.value.y}px`,
			};
		} else {
			// not needed until I do
			// return {
			// 	left: `${-0.5*this.body_size.x}px`,
			// 	top: `${-0.5*this.body_size.y}px`,
			// }
		}
	});

	return {
		children_allowed,
		enter_button_container_style_object,
	};
}
