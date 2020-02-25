<template lang="pug">

	include /mixins.pug

	doctype html

	.DialogPrompt(v-if = 'display')
		Modal(
			:title = 'title'
			ref = 'modal'
			:size = '{x: 400, y: 180}'
			:resizable = 'false'
			)
			.full_height_container.grid-y
				.cell.auto
					form
						input(
							type = 'text'
							ref = 'main_input'
							:value = 'default_value'
							@keypress.stop = 'on_keypress'
							@keyup.stop = ''
							@keydown.stop = ''
						)
				.cell.shrink.text-right
					.buttons
						.button.clear(@click = 'close') Cancel
						.button.success(
							@click = 'save'
							) {{confirm_label}}


</template>

<script lang="ts">
import Modal from './Modal.vue';
import {StoreController} from '../../../store/controllers/StoreController';

import {defineComponent, ref, computed, watch} from '@vue/composition-api';
export default defineComponent({
	name: 'dialog-prompt',
	components: {Modal},

	setup() {
		const main_input = ref<HTMLInputElement | null>(null);

		const display = computed(() => StoreController.editor.dialog_prompt.display());
		const title = computed(() => StoreController.editor.dialog_prompt.title());
		const default_value = computed(() => StoreController.editor.dialog_prompt.default_value());
		const confirm_label = computed(() => StoreController.editor.dialog_prompt.confirm_label());

		watch(display, (new_display) => {
			if (new_display) {
				focus_and_select();
			}
		});

		function focus_and_select() {
			main_input.value?.focus();
			main_input.value?.select();
		}

		function on_keypress(e: KeyboardEvent) {
			if (e.code === 'Enter' || e.code === 'NumpadEnter') {
				save();
				e.preventDefault();
			}
		}

		function save() {
			if (main_input.value) {
				const name = main_input.value.value;

				const on_save = StoreController.editor.dialog_prompt.on_save();
				if (on_save) {
					on_save(name);
				}

				close();
			}
		}

		function close() {
			StoreController.editor.dialog_prompt.hide();
		}

		return {
			main_input,
			display,
			title,
			default_value,
			confirm_label,
			on_keypress,
			save,
			close,
		};
	},
});
</script>

<style lang="sass">
@import "globals.sass"

.DialogPrompt
	background-color: white

	form
		padding: 10px
		input
			margin: 0

	.buttons
		padding: 10px
		margin-bottom: 0px
		.button
			margin-bottom: 0px
</style>
