import {Constants} from '../../../helpers/Constants';
import lodash_range from 'lodash/range';

import {EngineNodeData} from 'src/editor/store/modules/Engine';
import {StoreController} from 'src/editor/store/controllers/StoreController';
import {computed, Ref} from '@vue/composition-api';
export function SetupOutputs(
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

	const has_outputs: Readonly<Ref<boolean>> = computed(() => {
		if (node) {
			if (node.io.outputs.has_named_outputs) {
				return json_node.named_outputs.length > 0;
			} else {
				return node.io.outputs.has_outputs;
			}
		} else {
			return false;
		}
	});
	const output_container_style_object = computed(() => {
		if (layout_vertical) {
			return {
				top: `${0.5 * body_size.value.y}px`,
				left: `${-0.5 * body_size.value.x}px`,
				width: `${body_size.value.x}px`,
				height: `${Constants.CONNECTION_VERTICAL_MARGIN}px`,
			};
		} else {
			return {
				top: `${-0.5 * body_size.value.y}px`,
				left: `${0.5 * body_size.value.x}px`,
				width: `${Constants.CONNECTION_VERTICAL_MARGIN}px`,
				height: `${body_size.value.x}px`,
			};
		}
	});
	const output_names: Readonly<Ref<readonly string[]>> = computed(() => {
		if (node) {
			if (node.io.outputs.has_named_outputs) {
				return node.io.outputs.named_output_connection_points.map((o) => o.name);
			} else {
				return [];
			}
		} else {
			return [];
		}
	});
	const output_titles: Readonly<Ref<readonly string[]>> = computed(() => {
		if (node) {
			if (node.io.outputs.has_named_outputs) {
				return node.io.outputs.named_output_connection_points.map((o) => `${o.name} (${o.type})`);
			} else {
				return [];
			}
		} else {
			return [];
		}
	});
	const max_outputs_count = computed(() => {
		if (node) {
			if (node.io.outputs.has_named_outputs) {
				return json_node.named_outputs.length;
			} else {
				return 1;
			}
		} else {
			return 0;
		}
	});
	const available_outputs = computed(() => {
		return lodash_range(max_outputs_count.value);
	});
	const outputs_pixel_style_objects = computed(() => {
		if (layout_vertical) {
			// const intervals_count = this.available_outputs.length + 1
			return available_outputs.value.map((output, i) => {
				return {
					// marginLeft: `${100*(i+1)/intervals_count}%`
				};
			});
		} else {
			return available_outputs.value.map((output, i) => {
				return {
					top: `${Constants.CONNECTION_VERTICAL_SPACING * i + Constants.CONNECTION_VERTICAL_START}px`,
				};
			});
		}
	});
	const connection_element_output_class_objects = computed(() => {
		if (node) {
			return node.io.outputs.named_output_connection_points.map((output, i) => {
				return {
					[output.type]: true,
				};
			});
		} else {
			return {};
		}
	});

	return {
		has_outputs,
		output_container_style_object,
		output_names,
		output_titles,
		max_outputs_count,
		available_outputs,
		outputs_pixel_style_objects,
		connection_element_output_class_objects,
	};
}
