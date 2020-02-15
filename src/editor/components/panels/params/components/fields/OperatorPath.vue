<template lang='pug'>

	include /mixins.pug

	doctype html

	.Field.OperatorPath(
		:class = 'class_object'
		@contextmenu = 'on_contextmenu'
		)
		.grid-x
			.cell.auto

				input.value(
					:class = 'input_value_class_object'
					:value = 'raw_input'
					@keypress.stop = ''
					@keyup.stop = ''
					@keydown.stop = ''
					@change.stop = 'on_update_value'
					@blue.stop = 'on_update_value'
					type = 'text'
					:title = 'error_message'
					:tabindex = 'tabindex'
					)
				input.expression_result(
					:value = 'value'
					readonly
					type = 'text'
					:tabindex = 'tabindex'
					)

			.cell.shrink
				.button-group
					.button.tiny.primary(
						title = 'go to node'
						@click = 'go_to_node'
						)
						v-icon(name = "angle-double-right")
					.button.tiny.warning(
						title = 'select node'
						@click = 'open_node_selector'
						)
						v-icon(name = "align-left")


</template>

<script lang='ts'>
// mixins
import {SetupFieldCommon, ISetupFieldCommonProps, SetupFieldCommonProps} from './mixins/FieldCommon';
import {SetupContextMenu} from '../mixins/ContextMenu';

import {OperatorPathParam} from '../../../../../../engine/params/OperatorPath';
import {StoreController} from '../../../../../store/controllers/StoreController';
import {ParamSetCommand} from '../../../../../history/commands/ParamSet';

import {createComponent} from '@vue/composition-api';
import {CoreWalker} from '../../../../../../core/Walker';
export default createComponent({
	name: 'operator-path-field',
	props: SetupFieldCommonProps,
	// mixins: [Field, ContextMenu, TabIndexMixin],

	setup(props: ISetupFieldCommonProps) {
		const param = StoreController.engine.param(props.json_param.graph_node_id)! as OperatorPathParam;
		const setup_field_common = SetupFieldCommon(props);

		function on_update_value(e: Event) {
			const target = e.target as HTMLInputElement;
			if (target) {
				const cmd = new ParamSetCommand(param, target.value);
				cmd.push();
			}
		}

		function go_to_node() {
			param.compute();
			const node = param.found_node();
			if (node) {
				if (node.parent) {
					StoreController.editor.set_current_node(node.parent);

					if (node.parent.children_allowed() && node.parent.children_controller) {
						node.parent.children_controller.selection.set([node]);
					}
				}
			} else {
				__attempt_finding_parent();
			}
		}
		function __attempt_finding_parent(level = 1) {
			const path = param.value;
			const elements = path.split('/');
			if (elements.length == 1) {
				return;
			}
			for (let i = 0; i < level; i++) {
				elements.pop();
			}
			const parent_path = elements.join('/');
			const parent_node = CoreWalker.find_node(param.node, parent_path);
			if (parent_node) {
				StoreController.editor.set_current_node(parent_node);
			} else {
				__attempt_finding_parent(level + 1);
			}
		}

		function open_node_selector() {
			StoreController.editor.panel_node_selector.open({
				param_id: param.graph_node_id,
			});
			// return this.$store.commit('editor/param_node_selector/open', {param_id: this.param.graph_node_id()});
		}

		return {
			on_update_value,
			go_to_node,
			open_node_selector,
			// mixins,
			...setup_field_common,
			...SetupContextMenu(props.json_param, param),
		};
	},
});
</script>

<style lang='sass'>
	@import "globals.sass"

	.Field.OperatorPath
		.button-group
			position: relative
			top: 1px
			margin-right: 5px
			.button
				margin-left: 5px
				margin-bottom: 0px
				line-height: 0
				padding: 0.7em 1em

</style>
