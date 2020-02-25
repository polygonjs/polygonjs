import {EngineNodeData} from 'src/editor/store/modules/Engine';
import {StoreController} from 'src/editor/store/controllers/StoreController';
import {computed, Ref} from '@vue/composition-api';
export function SetupNamed(
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

	const name = computed(() => {
		return json_node.name;
	});
	const name_container_style_object = computed(() => {
		if (layout_vertical.value) {
			return {
				left: `${0.5 * body_size.value.x}px`,
				// top: `${0.5*this.body_size.y}px`,
			};
		} else {
			return {
				left: `${-0.5 * body_size.value.x}px`,
				top: `${-0.5 * body_size.value.y}px`,
			};
		}
	});

	const connection_name_element_class_objects = computed(() => {
		if (node) {
			if (node.io.inputs.has_named_inputs || node.io.outputs.has_named_outputs) {
				return {named_element: true};
			} else {
				return {non_named_element: true};
			}
		} else {
			return {};
		}
	});

	return {
		name,
		name_container_style_object,
		connection_name_element_class_objects,
	};
}
