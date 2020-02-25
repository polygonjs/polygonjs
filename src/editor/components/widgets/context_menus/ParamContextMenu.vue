<template lang="pug">

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

<script lang="ts">
import {BaseParamType} from 'src/engine/params/_Base';

import {CoreWalker} from 'src/core/Walker';

// components
import {StoreController} from '../../../store/controllers/StoreController';
// import {ParamType} from '../../../../engine/poly/ParamType';
import {DropDownMenuEntry} from '../../types/props';
import {ParamSetCommand} from '../../../history/commands/ParamSet';

enum ParamContextMenuEntryId {
	COPY = 'copy',
	PASTE = 'paste',
	REVERT_TO_DEFAULT = 'revert_to_default',
}

enum PasteParamContextMenuEntryId {
	// ASSET_PATH = 'asset_path',
	VALUE = 'value',
	AS_RELATIVE = 'as_relative',
	AS_ABSOLUTE = 'as_absolute',
}

import {defineComponent, computed, watch} from '@vue/composition-api';
import {ClipboardHelper} from '../../../helpers/Clipboard';
export default defineComponent({
	name: 'param-context-menu',

	setup() {
		const position = computed(() => {
			return StoreController.editor.context_menu.position();
		});
		const graph_node_id = computed(() => {
			return StoreController.editor.context_menu.param_id();
		});

		// let param
		// const param = computed(() => {
		// 	if (graph_node_id.value) {
		// 		return StoreController.scene.graph.node_from_id(graph_node_id.value) as BaseParamType;
		// 	}
		// });
		// const upload_name_to_paste = computed(() => {
		// 	return StoreController.editor.context_menu.upload_name();
		// });
		const param_to_paste = computed(() => {
			// const copied_param = ClipboardHelper.copied_param;
			const copied_param_graph_node_id = StoreController.editor.clipboard.param_id();
			if (copied_param_graph_node_id) {
				return StoreController.scene.graph.node_from_id(copied_param_graph_node_id) as BaseParamType;
			}
		});
		const active = computed(() => {
			return graph_node_id.value != null;
		});
		let param: BaseParamType | null = null;
		watch(active, (new_active) => {
			if (new_active && graph_node_id.value) {
				param = StoreController.scene.graph.node_from_id(graph_node_id.value) as BaseParamType;
			} else {
				param = null;
			}
		});

		const menu_entries = computed(() => {
			const paste_entries: DropDownMenuEntry[] = [];
			// console.log('param', param);
			// if (param && param.type == ParamType.STRING) {
			// 	const asset_disabled = StoreController.editor.clipboard.upload_name() == null;
			// 	paste_entries.push({
			// 		id: PasteParamContextMenuEntryId.ASSET_PATH,
			// 		label: 'Asset Path',
			// 		disabled: asset_disabled,
			// 	});
			// }

			const param_disabled = param_to_paste.value == null;
			paste_entries.push({id: PasteParamContextMenuEntryId.VALUE, label: 'Values', disabled: param_disabled});
			paste_entries.push({
				id: PasteParamContextMenuEntryId.AS_RELATIVE,
				label: 'As Relative',
				disabled: param_disabled,
			});
			paste_entries.push({
				id: PasteParamContextMenuEntryId.AS_ABSOLUTE,
				label: 'As Absolute',
				disabled: param_disabled,
			});
			return [
				{id: ParamContextMenuEntryId.COPY},
				{id: ParamContextMenuEntryId.PASTE, children: paste_entries},
				{id: 'revert_to_default'},
			];
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
				case ParamContextMenuEntryId.COPY:
					_copy();
					break;
				// case `${ParamContextMenuEntryId.PASTE}/${PasteParamContextMenuEntryId.ASSET_PATH}`:
				// 	_paste_upload_expression();
				// 	break;
				case `${ParamContextMenuEntryId.PASTE}/${PasteParamContextMenuEntryId.VALUE}`:
					_paste_values();
					break;
				case `${ParamContextMenuEntryId.PASTE}/${PasteParamContextMenuEntryId.AS_RELATIVE}`:
					_paste_relative_reference();
					break;
				case `${ParamContextMenuEntryId.PASTE}/${PasteParamContextMenuEntryId.AS_ABSOLUTE}`:
					_paste_absolute_reference();
					break;
				case ParamContextMenuEntryId.REVERT_TO_DEFAULT:
					_revert_to_default();
					break;
			}
			_close();
		}
		function _copy() {
			if (param) {
				ClipboardHelper.copy_param(param);
				// StoreController.editor.clipboard.set_param_id(param.graph_node_id);
			}
		}
		// function _paste_upload_expression() {
		// 	if (param) {
		// 		const expression = `\`asset("${upload_name_to_paste.value}")\``;
		// 		_set_param_value(expression, param); // we do set as value for string
		// 	}
		// }
		async function _paste_values() {
			if (param_to_paste.value && param) {
				await param_to_paste.value.compute();
				const new_value = param_to_paste.value.value;
				_set_param(new_value, param);
			}
		}
		function _paste_relative_reference() {
			if (param_to_paste.value && param) {
				let expression: string | undefined = undefined;
				if (param_to_paste.value.is_multiple && param_to_paste.value.components) {
					if (param.is_multiple) {
						// expression = param_to_paste.value.components().map((c, i) => {
						// 	return `ch("${CoreWalker.relative_path(
						// 		this.param.components()[i],
						// 		this.param_to_paste.components()[i]
						// 	)}")`;
						// });
					} else {
						expression = `ch("${CoreWalker.relative_path(param, param_to_paste.value.components[0])}")`;
					}
				} else {
					const relative_path = CoreWalker.relative_path(param, param_to_paste.value);
					expression = `ch("${relative_path}")`;
				}
				if (param && expression) {
					_set_param(expression, param);
				}
			}
		}
		function _paste_absolute_reference() {
			if (param_to_paste.value && param) {
				let expression: string | undefined = undefined;
				if (param_to_paste.value.is_multiple && param_to_paste.value.components != null) {
					if (param.is_multiple) {
						// expression = param_to_paste.value.components.map((c, i) => {
						// 	return `ch("${this.param_to_paste.components()[i].full_path()}")`;
						// });
					} else {
						const first_component: BaseParamType = param_to_paste.value.components[0];
						if (first_component) {
							expression = `ch("${first_component.full_path()}")`;
						}
					}
				} else {
					expression = `ch("${param_to_paste.value.full_path()}")`;
				}
				if (expression && param) {
					_set_param(expression, param);
				}
			}
		}
		function _revert_to_default() {
			if (param) {
				const default_value = param.default_value;
				_set_param(default_value, param as BaseParamType);
			}
		}
		function _set_param(raw_input: any, param: BaseParamType) {
			if (param_to_paste.value && param) {
				const params_are_multiple = param_to_paste.value.is_multiple && param.is_multiple;
				const params_are_single = !param_to_paste.value.is_multiple && !param.is_multiple;
				// if both params are multiple or both are single, we can paste the raw_input as is
				if (params_are_multiple || params_are_single) {
					// no change to raw_input
				} else {
					// if one param is multiple and one is single, we need to modify what we paste first
					if (param_to_paste.value.is_multiple && !param.is_multiple) {
						raw_input = raw_input.toArray()[0];
					} else {
						const raw_input_as_array = [];
						if (param.components) {
							for (let i = 0; i < param.components.length; i++) {
								raw_input_as_array.push(raw_input);
							}
						}
						raw_input = raw_input_as_array;
					}
				}
			}
			const cmd = new ParamSetCommand(param as any, raw_input as any);
			cmd.push();

			// const target_param:BaseParamType = param || this.param;
			// this._set_param({value: value}, param);
		}
		// function _set_param_expression(expression: string, param: BaseParamType) {
		// 	const cmd = new ParamSetCommand(param as any, expression as any);
		// 	cmd.push();
		// 	// this._set_param({expression: expression});
		// }
		// function _set_param(options, param: BaseParam) {
		// 	param = param || this.param;
		// 	const cmd = new History.Command.ParamSet(param, options);
		// 	cmd.push(this);
		// }
		function _close() {
			setTimeout(() => {
				StoreController.editor.context_menu.set_param_id(null);
			}, 10);

			// this.$store.commit('editor/menu/param_id', null);
		}

		return {
			active,
			on_select,
			menu_entries,
			style_object,
		};
	},
});
</script>

<style lang="sass">
@import "globals.sass"

.ParamMenu
	position: absolute
</style>
