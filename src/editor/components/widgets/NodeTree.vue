<template lang='pug'>

	include /mixins.pug

	doctype html

	.NodeTree(:class = 'class_object')
		.grid-x
			.cell.shrink
				.expand_button(
					@click = 'toggle_expanded'
					:style = 'expand_button_class_object'
					) {{expand_label}}
			.cell.auto
				.node_name(
					@click = 'on_click'
					) {{node_name}}
				.children(
					v-if = 'expanded'
					)
					NodeTree(
						v-for = 'child, i in children'
						:node = 'child'
						:node_selection_context = 'node_selection_context'
						:selected_graph_node_id = 'selected_graph_node_id'
						:key = 'children_keys[i]'
						@select = 'on_child_select'
						)


</template>

<script lang='ts'>
import lodash_sortBy from 'lodash/sortBy';

interface NodeTreeProps {
	graph_node_id: string;
	context: NodeContext | null;
	selected_graph_node_id: string;
}
import {NodeContext} from '../../../engine/poly/NodeContext';
import {StoreController} from '../../store/controllers/StoreController';
import {BaseNodeType} from '../../../engine/nodes/_Base';

import {createComponent, ref, computed, SetupContext} from '@vue/composition-api';
export default createComponent({
	name: 'node-tree',

	props: {
		node: {
			type: Object,
			default() {
				return {};
			},
		},
		node_selection_context: {
			type: String,
			default() {
				return null;
			},
		},
		selected_graph_node_id: {
			type: String,
			default: null,
		},
	},

	setup(props: NodeTreeProps, context: SetupContext) {
		const expanded = ref(false);
		const node = StoreController.engine.node(props.graph_node_id) as BaseNodeType;

		const selected = computed(() => {
			return node.graph_node_id == props.selected_graph_node_id;
		});
		const class_object = computed(() => {
			return {selected: selected.value};
		});
		const expand_label = computed(() => {
			if (expanded.value) {
				return '-';
			} else {
				return '+';
			}
		});
		const expand_button_class_object = computed(() => {
			return {opacity: expandable.value ? 1 : 0};
		});

		const node_name = computed(() => {
			const parent = node.parent;
			if (parent) {
				return node.name;
			} else {
				return '/';
			}
		});

		const children = computed(() => {
			let list = lodash_sortBy(node.children(), (child) => child.name);
			const selectable_children: BaseNodeType[] = [];
			if (props.context) {
				for (let child of list) {
					if (child.children_allowed() && child.children_controller) {
						if (
							child.children_controller.has_children_and_grandchildren_with_context(props.context) ||
							child.node_context() == props.context
						) {
							selectable_children.push(child);
						}
					}
				}
			}

			return selectable_children;
		});

		const expandable = computed(() => {
			return node.children_allowed() && node.children().length > 0;
		});
		const children_keys = computed(() => {
			return children.value.map((child) => child.graph_node_id);
		});

		// functions
		function toggle_expanded() {
			expanded.value = !expanded.value;
		}

		function on_click() {
			context.emit('select', node);
		}
		function on_child_select(node: BaseNodeType) {
			context.emit('select', node);
		}

		return {
			expanded,
			selected,
			class_object,
			expand_label,
			expand_button_class_object,
			node_name,
			children,
			expandable,
			children_keys,
			toggle_expanded,
			on_click,
			on_child_select,
		};
	},
});
</script>

<style lang='sass'>
	@import "globals.sass"

	$color_selected: mix($color_bg_modal, $primary-color, 50%)
	$color_hover: mix($color_bg_modal, $primary-color, 80%)
	.NodeTree
		// background-color: blue
		margin-bottom: 5px
		&.selected
			.node_name
				background-color: $color_selected
		.expand_button
			cursor: pointer
			padding: 0px 5px
			&:hover
				opacity: 0.8
		.node_name
			cursor: pointer
			padding: 0px 5px
			&:hover
				background-color: $color_hover

</style>
