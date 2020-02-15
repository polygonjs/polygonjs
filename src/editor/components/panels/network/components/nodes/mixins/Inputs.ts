import {Constants} from '../../../helpers/Constants';
import lodash_range from 'lodash/range';

import {EngineNodeData} from 'src/editor/store/modules/Engine';
import {StoreController} from 'src/editor/store/controllers/StoreController';
import {BaseNodeClass} from 'src/engine/nodes/_Base';
import {computed, Ref} from '@vue/composition-api';
export function SetupInputs(
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

	const inputs = computed(() => {
		return json_node.inputs || [];
	});
	const input_names = computed(() => {
		if (node) {
			if (node.io.inputs.has_named_inputs) {
				return json_node.named_inputs.map((i) => i.name);
			} else {
				return (node.constructor as typeof BaseNodeClass).displayed_input_names();
			}
		} else {
			return [];
		}
	});
	const input_titles = computed(() => {
		if (node) {
			if (node.io.inputs.has_named_inputs) {
				return node.io.inputs.named_input_connection_points.map((i) => `${i.name} (${i.type})`);
			} else {
				return [];
			}
		}
	});
	const input_connection_output_indices = computed(() => {
		return json_node.input_connection_output_indices || [];
	});
	const input_json_nodes = computed(() => {
		return json_node.inputs.map((graph_node_id) => {
			if (graph_node_id) {
				return StoreController.engine.json_node(graph_node_id);
			}
		});
	});
	const input_valid_states = computed(() => {
		return json_node.inputs.map((graph_node_id) => {
			return graph_node_id != null;
		});
	});
	const max_inputs_count: Readonly<Ref<number>> = computed(() => {
		return node?.io.inputs.max_inputs_count || 0;
	});
	const available_inputs: Readonly<Ref<readonly number[]>> = computed(() => {
		let count: number = max_inputs_count.value;
		if (node) {
			if (node.io.inputs.has_named_inputs) {
				count = json_node.named_inputs.length;
			}
			return lodash_range(count);
		} else {
			return [];
		}
	});
	const inputs_container_style_object = computed(() => {
		if (layout_vertical.value) {
			return {
				bottom: `${0.5 * body_size.value.y}px`,
				left: `${-0.5 * body_size.value.x}px`,
				width: `${body_size.value.x}px`,
				height: `${Constants.CONNECTION_VERTICAL_MARGIN}px`,
			};
		} else {
			return {
				top: `${-0.5 * body_size.value.y}px`,
				left: `${-0.5 * body_size.value.x - Constants.CONNECTION_VERTICAL_MARGIN}px`,
				width: `${Constants.CONNECTION_VERTICAL_MARGIN}px`,
				height: `${body_size.value.y}px`,
			};
		}
	});
	// input_style_objects() {
	// 	const intervals_count = this.max_inputs_count + 1
	// 	return lodash_range(this.max_inputs_count).map((input, i)=>{
	// 		return {
	// 			marginLeft: `${100*(i+2)/intervals_count}%`
	// 		}
	// 	})
	// },
	const inputs_pixel_style_objects = computed(() => {
		if (layout_vertical) {
			const intervals_count = available_inputs.value.length + 1;
			return available_inputs.value.map((input, i) => {
				return {
					marginLeft: `${(100 * (i + 1)) / intervals_count}%`,
				};
			});
		} else {
			return available_inputs.value.map((input, i) => {
				return {
					top: `${Constants.CONNECTION_VERTICAL_SPACING * i + Constants.CONNECTION_VERTICAL_START}px`,
				};
			});
		}
	});
	const connection_element_input_class_objects = computed(() => {
		if (node) {
			if (node.io.inputs.has_named_inputs) {
				return node.io.inputs.named_input_connection_points.map((input, i) => {
					return {
						[input.type]: true,
					};
				});
			} else {
				return [];
			}
		} else {
			return {};
		}
	});

	return {
		inputs,
		input_names,
		input_titles,
		input_connection_output_indices,
		input_json_nodes,
		input_valid_states,
		max_inputs_count,
		available_inputs,
		inputs_container_style_object,
		inputs_pixel_style_objects,
		connection_element_input_class_objects,
	};
}
