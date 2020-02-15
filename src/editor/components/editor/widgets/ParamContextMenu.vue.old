
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
import {CoreWalker} from 'src/core/Walker';

// components
import DropDownMenu from 'src/editor/components/widgets/DropDownMenu.vue';
import {StoreController} from '../../../store/controllers/StoreController';
import {ParamType} from '../../../../engine/poly/ParamType';
import {DropDownMenuEntry} from '../../types/props';
import {ParamSetCommand} from '../../../history/commands/ParamSet';
import {BaseParamType} from '../../../../engine/params/_Base';

import {createComponent, computed} from '@vue/composition-api';
export default createComponent({
	name: 'param-context-menu',
	components: {DropDownMenu},

	setup() {
		const graph_node_id = computed(() => StoreController.editor.context_menu.node_id()!);
		const param = StoreController.engine.param(graph_node_id.value)!;

		const copied_param_graph_node_id = StoreController.editor.clipboard.param_id();
		const param_to_paste: BaseParamType | null = copied_param_graph_node_id
			? StoreController.engine.param(copied_param_graph_node_id)
			: null;

		const position = computed(() => StoreController.editor.context_menu.position());
		const upload_name_to_paste = computed(() => StoreController.editor.context_menu.upload_name());
		const active = computed(() => {
			return graph_node_id.value != null;
		});
		const menu_entries = computed(() => {
			const paste_entries: DropDownMenuEntry[] = [];
			if (param.type == ParamType.STRING) {
				const asset_disabled = StoreController.editor.clipboard.upload_name() == null;
				paste_entries.push({id: 'asset_path', label: 'Asset Path', disabled: asset_disabled});
			}

			const param_disabled = param_to_paste == null;
			paste_entries.push({id: 'values', label: 'Values', disabled: param_disabled});
			paste_entries.push({id: 'as_relative', label: 'As Relative', disabled: param_disabled});
			paste_entries.push({id: 'as_absolute', label: 'As Absolute', disabled: param_disabled});
			return [{id: 'copy'}, {id: 'paste', children: paste_entries}, {id: 'revert_to_default'}];
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
				case 'copy':
					copy();
					break;
				case 'paste/asset_path':
					paste_upload_expression();
					break;
				case 'paste/values':
					paste_values();
					break;
				case 'paste/as_relative':
					paste_relative_reference();
					break;
				case 'paste/as_absolute':
					paste_absolute_reference();
					break;
				case 'revert_to_default':
					revert_to_default();
					break;
			}
			close();
		}
		function copy() {
			StoreController.editor.clipboard.set_param_id(graph_node_id.value);
			// $store.commit('editor/clipboard/param', param.graph_node_id());
		}
		function paste_upload_expression() {
			const expression = `\`asset("${upload_name_to_paste}")\``;
			_set_param(param, expression); // we do set as value for string
		}
		async function paste_values() {
			if (param_to_paste) {
				await param_to_paste.compute();
				const new_value = param_to_paste.value;
				_set_param(param, new_value);
			}
		}
		function paste_relative_reference() {
			if (param_to_paste) {
				let expression;
				if (param_to_paste.components) {
					if (param.components) {
						// expression = param_to_paste.components().map((c, i) => {
						// 	return `ch("${CoreWalker.relative_path(
						// 		param.components()[i],
						// 		param_to_paste.components()[i]
						// 	)}")`;
						// });
					} else {
						expression = `ch("${CoreWalker.relative_path(param, param_to_paste.components[0])}")`;
					}
				} else {
					const relative_path = CoreWalker.relative_path(param, param_to_paste);
					expression = `ch("${relative_path}")`;
				}
				_set_param(param, expression);
			}
		}
		function paste_absolute_reference() {
			if (param_to_paste) {
				let expression;
				if (param_to_paste.components) {
					if (param.components) {
						expression = param_to_paste.components.map((c, i) => {
							return `ch("${param_to_paste.components![i].full_path()}")`;
						});
					} else {
						expression = `ch("${param_to_paste.components[0].full_path()}")`;
					}
				} else {
					expression = `ch("${param_to_paste.full_path()}")`;
				}
				_set_param(param, expression);
			}
		}
		function revert_to_default() {
			const default_value = param.default_value;
			_set_param(param, default_value);
		}
		// function _set_param_value(value, param: BaseParam) {
		// 	param = param || param;
		// 	_set_param({value: value}, param);
		// }
		// function _set_param_expression(expression) {
		// 	_set_param({expression: expression});
		// }
		function _set_param(param: BaseParamType, value: any) {
			const cmd = new ParamSetCommand(param as any, value);
			cmd.push();
		}
		function close() {
			StoreController.editor.context_menu.set_param_id(null);
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
