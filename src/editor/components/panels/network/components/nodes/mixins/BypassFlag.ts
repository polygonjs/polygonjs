import {Constants} from '../../../helpers/Constants';
import {EngineNodeData} from 'src/editor/store/modules/Engine';

import {Ref, computed} from '@vue/composition-api';
import {StoreController} from 'src/editor/store/controllers/StoreController';
export function SetupBypassFlag(
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

	const has_bypass_flag: Readonly<Ref<Readonly<boolean>>> = computed(() => {
		return json_node.flags?.bypass != null;
	});
	const is_bypassed: Readonly<Ref<Readonly<boolean>>> = computed(() => {
		return json_node.flags?.bypass == true;
	});
	const bypass_flag_container_style_object = computed(() => {
		return {
			top: `${-0.5 * Constants.NODE_HEIGHT}px`,
			left: `${-0.5 * (node?.ui_data.width() || 100) + 2}px`,
			height: `${body_size.value.y}px`,
		};
	});
	const bypass_flag_style_object = computed(() => {
		const v_padding = 5;
		return {
			top: `${v_padding}px`,
			height: `${body_size.value.y - 2 * v_padding}px`,
		};
	});
	const bypass_flag_class_object = computed(() => {
		return {
			on: is_bypassed.value,
			off: !is_bypassed.value,
		};
	});

	return {
		has_bypass_flag,
		is_bypassed,
		bypass_flag_container_style_object,
		bypass_flag_style_object,
		bypass_flag_class_object,
	};
}
