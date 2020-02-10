<template lang='pug'>

	include /mixins.pug

	doctype html

	.DialogAlert(v-if = 'display')
		Modal(
			:title = 'title'
			ref = 'modal'
			:size = '{x: 400, y: 180}'
			:resizable = 'false'
			)
			.full_height_container.grid-y
				.cell.auto.text-center.message-container {{message}}
				.cell.shrink.text-right
					.buttons
						.button.success(
							@click = 'close'
							) Ok


</template>

<script lang='ts'>
import Modal from './Modal.vue';
import {StoreController} from '../../../store/controllers/StoreController';

import {createComponent, computed} from '@vue/composition-api';
export default createComponent({
	name: 'dialog-alert',
	components: {Modal},

	setup() {
		console.log('StoreController.editor.dialog_alert', StoreController.editor.dialog_alert);
		const display = computed(() => StoreController.editor.dialog_alert.display());
		const message = computed(() => StoreController.editor.dialog_alert.message());
		const title = computed(() => StoreController.editor.dialog_alert.title());

		function close() {
			StoreController.editor.dialog_alert.hide();
		}

		return {
			display,
			message,
			title,
			close,
		};
	},
});
</script>

<style lang='sass'>
	@import "globals.sass"

	.DialogAlert
		background-color: white

		.message-container
			padding: 20px

		.buttons
			padding: 10px
			margin-bottom: 0px

</style>
