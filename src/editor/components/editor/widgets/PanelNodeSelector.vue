<template lang='pug'>

	include /mixins.pug

	doctype html

	.NodeSelector(
		v-if = 'display'
		)
		Modal(
			title = 'Choose an event node:'
			ref = 'modal'
			)
			.full_height_container.grid-y
				.cell.auto
					NodeTree(
						:node = 'root'
						:selected_graph_node_id = 'selected_graph_node_id'
						@select = 'on_select'
						)
				.cell.shrink.text-right
					.buttons
						.button.success(
							@click = 'accept_selected'
							:class = 'accept_button_class_object'
							) Accept
						.button.clear(@click = 'close') Cancel


</template>

<script lang='ts'>
// components
import Modal from '../../widgets/dialogs/Modal.vue';
import NodeTree from '../../widgets/NodeTree.vue';

import {createComponent, ref, watch, computed} from '@vue/composition-api';
import {StoreController} from '../../../store/controllers/StoreController';
import {ParamSetCommand} from '../../../history/commands/ParamSet';
export default createComponent({
	name: 'panel-node-selector',
	components: {Modal, NodeTree},

	setup() {
		const selected_graph_node_id = ref<string | null>(null);

		// const panel_id = computed(()=>{
		// 	return this.$store.getters['editor/panel_node_selector/panel_id'];
		// })
		const param_id = computed(() => {
			return StoreController.editor.panel_node_selector.param_id();
		});

		const display = computed(() => {
			return param_id.value != null;
		});

		const accept_button_class_object = computed(() => {
			return {disabled: selected_graph_node_id.value == null};
		});

		watch(display, () => {
			selected_graph_node_id.value = null;
		});

		// functions
		function on_select(graph_node_id: string) {
			selected_graph_node_id.value = graph_node_id;
		}

		function accept_selected() {
			if (selected_graph_node_id.value) {
				const selected_node = StoreController.engine.node(selected_graph_node_id.value);
				const param_id = StoreController.editor.panel_node_selector.param_id();
				if (param_id) {
					const param = StoreController.engine.param(param_id);
					if (selected_node && param) {
						const cmd = new ParamSetCommand(param as any, selected_node.full_path());
						cmd.push();
					}
				}

				// const editor = this.$root.$children[0];
				// const viewer = editor.panel_with_id(lodash_clone(this.panel_id));
				// viewer.set_event_node(selected_node);

				close();
			}
		}

		function close() {
			StoreController.editor.panel_node_selector.close();
		}

		// to_json() {
		// 	return this.refs.modal.to_json();
		// }

		return {
			param_id,
			display,
			accept_button_class_object,
			// functions
			on_select,
			accept_selected,
			close,
		};
	},
});
</script>

<style lang='sass'>
	@import "globals.sass"

	.NodeSelector
		background-color: red

		.buttons
			margin-bottom: 10px

</style>
