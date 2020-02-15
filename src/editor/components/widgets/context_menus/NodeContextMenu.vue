
<template lang='pug'>

	include /mixins.pug

	doctype html

	.ParamMenu(
		v-if = 'active'
		:style = 'style_object'
		)
		DropDownMenu(
			:display_label = 'false'
			:always_visible = 'true'
			:entries = 'menu_entries'
			:sort_entries = 'true'
			@select = 'on_select'
		)



</template>

<script lang='ts'>
import {ClipboardHelper} from 'src/editor/helpers/Clipboard';

// components
import DropDownMenu from 'src/editor/components/widgets/DropDownMenu.vue';

import {NodeSetCommentCommand} from 'src/editor/history/commands/NodeSetComment';
import {NodeSetOverrideClonableStateCommand} from 'src/editor/history/commands/NodeSetOverrideClonableState';
import {StoreController} from '../../../store/controllers/StoreController';
import {DropDownMenuEntry} from '../../types/props';

enum NodeContextMenuEntryId {
	EDIT_COMMENT = 'edit_comment',
	COPY_FULL_PATH = 'copy_full_path',
	TOGGLE_CLONE_INPUTS = 'toggle_clone_inputs',
}

import {createComponent, computed, Ref, watch} from '@vue/composition-api';
export default createComponent({
	name: 'node-context-menu',
	components: {DropDownMenu},

	setup() {
		const graph_node_id = computed(() => StoreController.editor.context_menu.node_id()!);
		let node = StoreController.engine.node(graph_node_id.value)!;
		watch(graph_node_id, () => {
			node = StoreController.engine.node(graph_node_id.value)!;
		});

		const position = computed(() => StoreController.editor.context_menu.position());
		const json_node = computed(() => {
			return StoreController.engine.json_node(graph_node_id.value)!;
		});
		const active = computed(() => {
			return graph_node_id.value != null;
		});
		const menu_entries: Readonly<Ref<readonly DropDownMenuEntry[]>> = computed(() => {
			const entries: DropDownMenuEntry[] = [
				{id: NodeContextMenuEntryId.EDIT_COMMENT},
				{id: NodeContextMenuEntryId.COPY_FULL_PATH},
				// {id: 'enter'},
				// {id: 'delete'},
				// {id: 'select_inputs'},
			];

			if (node && node.io.inputs.override_clonable_state_allowed()) {
				const label = json_node.value.override_clonable_state ? 'set clone inputs ON' : 'set clone inputs OFF';
				entries.push({id: NodeContextMenuEntryId.TOGGLE_CLONE_INPUTS, label: label});
			}
			return entries;
		});
		const style_object = computed(() => {
			return {
				top: `${Math.floor(position.value.y)}px`,
				left: `${Math.floor(position.value.x)}px`,
			};
		});

		// functions
		function on_select(entry: string) {
			switch (entry) {
				// case 'copy': copy(); break;
				case NodeContextMenuEntryId.EDIT_COMMENT:
					edit_comment();
					break;
				case NodeContextMenuEntryId.COPY_FULL_PATH:
					copy_full_path();
					break;
				case NodeContextMenuEntryId.TOGGLE_CLONE_INPUTS:
					toggle_clone_inputs();
					break;
			}
			_close();
		}
		async function edit_comment() {
			// we need to keep a reference to the node,
			// as the component will be gone when the comment is being typed
			const node_tmp = node;
			const current_comment = node_tmp.ui_data.comment;
			const has_comment: boolean = current_comment != null && current_comment != '';
			const title = has_comment ? 'Change comment' : 'Add comment';
			const new_comment = await StoreController.editor.dialog_prompt.show({
				title: title,
				default_value: current_comment || '',
				confirm_label: 'Save',
			});
			// window.POLY_prompt(this, 'Edit Comment:', node_tmp.ui_data.comment, {
			// 	confirm_label: 'Update Comment',
			// });
			const cmd = new NodeSetCommentCommand(node_tmp, new_comment);
			cmd.push();
		}
		function copy_full_path() {
			const path = node.full_path();
			ClipboardHelper.copy(path);
			// $store.commit('editor/status_bar/notice', `Copied ${path} to clipboard`);
		}
		function toggle_clone_inputs() {
			const current_state = node.io.inputs.override_clonable_state();
			const new_state = !current_state;
			const cmd = new NodeSetOverrideClonableStateCommand(node, new_state);
			cmd.push();
		}
		function _close() {
			setTimeout(() => {
				StoreController.editor.context_menu.set_node_id(null);
			}, 10);
		}

		return {
			active,
			menu_entries,
			style_object,
			on_select,
		};
	},
});
</script>

<style lang='sass'>
	@import "globals.sass"

	.ParamMenu
		position: absolute



</style>
