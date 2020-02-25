<template lang="pug">

	include /mixins.pug

	doctype html

	.DialogConfirm(v-if = 'display')
		Modal(
			:title = 'question'
			ref = 'modal'
			:size = '{x: 400, y: 120}'
			:resizable = 'false'
			)
			.full_height_container.grid-y
				.cell.shrink.text-center
					.buttons
						button.button.clear(
							ref = 'cancel_button'
							@click = 'close'
							) Cancel
						button.button.alert(
							ref = 'accept_button'
							@click = 'accept'
							) {{accept_label}}


</template>

<script lang="ts">
import Modal from './Modal.vue';
import {StoreController} from '../../../store/controllers/StoreController';

import {defineComponent, computed, watch, ref} from '@vue/composition-api';
export default defineComponent({
	name: 'dialog-confirm',
	components: {Modal},

	setup() {
		const cancel_button = ref<HTMLButtonElement | null>(null);

		const display = computed(() => StoreController.editor.dialog_confirm.display());
		const question = computed(() => StoreController.editor.dialog_confirm.question());
		const accept_label = computed(() => StoreController.editor.dialog_confirm.accept_label());

		watch(display, (new_display) => {
			if (new_display) {
				focus_and_select();
			}
		});

		function focus_and_select() {
			if (cancel_button.value) {
				cancel_button.value.focus();
			}
		}

		function accept() {
			const on_accept = StoreController.editor.dialog_confirm.on_accept();
			if (on_accept) {
				on_accept();
			}

			close();
		}

		function close() {
			StoreController.editor.dialog_confirm.hide();
		}

		return {
			cancel_button,
			display,
			question,
			accept_label,
			accept,
			close,
		};
	},
});
</script>

<style lang="sass">
@import "globals.sass"

.DialogConfirm
	background-color: white


	.buttons
		padding: 10px
		margin-bottom: 10px
</style>
