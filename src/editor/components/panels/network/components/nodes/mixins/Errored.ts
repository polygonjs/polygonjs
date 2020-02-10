import {Constants} from '../../../helpers/Constants';

import {EngineNodeData} from 'src/editor/store/modules/Engine';
import {StoreController} from 'src/editor/store/controllers/StoreController';
import {Ref, computed} from '@vue/composition-api';
export function SetupErrored(
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

	const error_message = computed(() => {
		if (json_node) {
			return json_node.error_message;
		}
	});
	const is_errored: Readonly<Ref<boolean>> = computed(() => {
		return error_message.value != null;
	});
	const error_flag_container_style_object = computed(() => {
		return {
			top: `${-0.5 * Constants.NODE_HEIGHT}px`,
			left: `${-0.5 * (node?.ui_data.width() || 100)}px`,
			width: `${node?.ui_data.width() || 100}px`,
			height: `${body_size.value.y}px`,
		};
	});

	return {
		error_message,
		is_errored,
		error_flag_container_style_object,
	};
}
