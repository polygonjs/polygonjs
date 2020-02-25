<template lang="pug">

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
						:graph_node_id = 'child.graph_node_id'
						:node_context = 'node_context'
						:selected_graph_node_id = 'selected_graph_node_id'
						:key = 'child.graph_node_id'
						@select = 'on_child_select'
						)


</template>

<script lang="ts">
import lodash_sortBy from 'lodash/sortBy';

interface NodeTreeProps {
	graph_node_id: string;
	node_context: NodeContext | null;
	selected_graph_node_id: string;
	init_expanded?: boolean;
}
import {NodeContext} from '../../../engine/poly/NodeContext';
import {StoreController} from '../../store/controllers/StoreController';
import {BaseNodeType} from '../../../engine/nodes/_Base';

import {defineComponent, ref, computed, SetupContext} from '@vue/composition-api';
export default defineComponent({
	name: 'node-tree',

	props: {
		graph_node_id: {
			type: String,
			default: null,
		},
		node_context: {
			type: String,
			default() {
				return null;
			},
		},
		selected_graph_node_id: {
			type: String,
			default: null,
		},
		init_expanded: {
			type: Boolean,
			default: false,
		},
	},

	setup(props: NodeTreeProps, context: SetupContext) {
		const expanded = ref(props.init_expanded || false);
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
			if (props.node_context) {
				for (let child of list) {
					const has_children_with_context =
						child.children_allowed() &&
						child.children_controller &&
						child.children_controller.has_children_and_grandchildren_with_context(props.node_context);
					const is_context = child.node_context() == props.node_context;
					if (has_children_with_context || is_context) {
						selectable_children.push(child);
					}
				}
			} else {
				for (let child of list) {
					selectable_children.push(child);
				}
			}

			return selectable_children;
		});

		const expandable = computed(() => {
			return node.children_allowed() && node.children().length > 0;
		});

		// functions
		function toggle_expanded() {
			expanded.value = !expanded.value;
		}

		function on_click() {
			context.emit('select', props.graph_node_id);
		}
		function on_child_select(node_id: string) {
			context.emit('select', node_id);
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
			toggle_expanded,
			on_click,
			on_child_select,
		};
	},
});
</script>

<style lang="sass">
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
