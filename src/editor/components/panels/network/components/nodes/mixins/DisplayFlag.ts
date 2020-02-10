import {Constants} from '../../../helpers/Constants';
import {EngineNodeData} from 'src/editor/store/modules/Engine';
import {StoreController} from 'src/editor/store/controllers/StoreController';

import {Ref, computed} from '@vue/composition-api';
export function SetupDisplayFlag(
	json_node: EngineNodeData,
	body_size: Readonly<
		Ref<
			Readonly<{
				x: number;
				y: number;
			}>
		>
	>
) {
	const node = StoreController.engine.node(json_node.graph_node_id);

	const has_display_flag: Readonly<Ref<boolean>> = computed(() => {
		return json_node.flags?.display != null;
	});
	const display_flag_container_style_object = computed(() => {
		return {
			top: `${-0.5 * Constants.NODE_HEIGHT}px`,
			left: `${0.5 * (node?.ui_data.width() || 100) - 2}px`,
			height: `${body_size.value.y}px`,
		};
	});
	const display_flag_style_object = computed(() => {
		const v_padding = 5;
		return {
			top: `${v_padding}px`,
			height: `${body_size.value.y - 2 * v_padding}px`,
		};
	});
	const display_flag_class_object = computed(() => {
		const display = json_node.flags?.display == true;
		return {
			on: display,
			off: !display,
		};
	});

	return {
		has_display_flag,
		display_flag_container_style_object,
		display_flag_style_object,
		display_flag_class_object,
	};
}
