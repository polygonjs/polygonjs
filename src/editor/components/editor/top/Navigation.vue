<template lang="pug">

	include /mixins.pug

	doctype html

	.NavigationBar
		.grid-x
			.cell.shrink
				.button-group
					.button.tiny.primary(
						:class = 'go_backward_class_object'
						@click = 'go_backward'
						)
						v-icon(name = "angle-double-left")
					.button.tiny.primary(
						:class = 'go_forward_class_object'
						@click = 'go_forward'
						)
						v-icon(name = "angle-double-right")
			.cell.auto
				ul.path_elements
					li.path_element(
						)
						span.path_element_name(
							@click = 'go_to_path("/")'
						) /

					li.path_element(
						v-for = 'path_element, i in path_elements'
						:key = 'i'
						)
						span.path_element_name(
							@click = 'go_to_path_elements_index(i)'
							) {{ path_element }}
						span.path_separator(v-if = 'i < (path_elements.length-1)') /


</template>

<script lang="ts">
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// let component;
// import NodeOwner from 'src/Editor/Component/Mixin/NodeOwner';

import {BaseNodeType} from 'src/engine/nodes/_Base';
import {StoreController} from 'src/editor/store/controllers/StoreController';

import {createComponent, ref, watch, computed, onMounted} from '@vue/composition-api';
export default createComponent({
	name: 'navigation-bar',
	// mixins: [NodeOwner],

	setup() {
		const history = ref<string[]>([]);
		const index = ref(0);

		onMounted(() => {
			push_to_history(current_path.value);
		});

		// computed
		const node = computed(() => StoreController.editor.current_node());
		const current_path = computed(() => (node.value ? node.value.full_path() : ''));
		const path_elements = computed(() => {
			const elements = current_path.value.split('/');
			elements.shift();
			return elements;
		});
		const go_backward_allowed = computed(() => {
			return index.value > 0 && history.value.length > 0;
		});
		const go_forward_allowed = computed(() => {
			return index.value < history.value.length - 1;
		});
		const go_backward_class_object = computed(() => {
			return {disabled: !go_backward_allowed.value};
		});
		const go_forward_class_object = computed(() => {
			return {disabled: !go_forward_allowed.value};
		});

		// watch
		watch(() => {
			const old_path = current_path.value;
			if (current_path.value != history.value[index.value]) {
				history.value.splice(index.value + 1, history.value.length);
				push_to_history(old_path);
			}
		});

		// methods
		function push_to_history(path: string) {
			history.value.push(path);
			index.value = history.value.length - 1;
		}

		function go_to_path_elements_index(i: number) {
			const path = path_elements.value.slice(0, i + 1).join('/');
			go_to_path(path);
		}

		function go_backward() {
			index.value -= 1;
			const path = history.value[index.value];
			if (path) {
				go_to_path(path);
			}
		}

		function go_forward() {
			index.value += 1;
			const path = history.value[index.value];
			if (path) {
				go_to_path(path);
			}
		}

		function go_to_path(path: string) {
			const node = StoreController.scene.node(path);
			if (node) {
				go_to_node(node);
			}
		}
		function go_to_node(node: BaseNodeType) {
			StoreController.editor.set_current_node(node);
		}

		return {
			path_elements,
			go_to_path_elements_index,
			go_backward_allowed,
			go_forward_allowed,
			go_backward_class_object,
			go_forward_class_object,
			go_backward,
			go_forward,
			go_to_path,
			go_to_node,
		};
	},
});
</script>

<style lang="sass">
@import "globals.sass"

// $color_bg: $color_bg_dark
$color_bg_path_elements: lighten($color_bg_dark, 25%)
// $border_color: lighten($color_bg, 10%)
$color_bg_clickable_path_element_name: darken($color_bg_path_elements, 10%)
$color_bg_clickable_path_element_name_hover: gray
.NavigationBar
	background-color: $color_bg_panel

	ul.path_elements, .button-group
		padding: 5px 5px

	.button-group
		.button
			margin-top: 4px
			margin-left: 5px

	ul.path_elements
		margin: 5px

			// border: 1px solid $border_color
		border-radius: 3px
		background-color: $color_bg_path_elements
		.path_element
			display: inline-block
			&:not(:last-child)
				.path_element_name
					margin-left: 5px
					background-color: $color_bg_clickable_path_element_name
					&:hover
						cursor: pointer
						background-color: $color_bg_clickable_path_element_name_hover
						opacity: 0.75
			.path_element_name, .path_separator
				padding: 5px
				display: inline-block
</style>
