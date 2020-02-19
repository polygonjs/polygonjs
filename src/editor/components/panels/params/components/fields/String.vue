<template lang='pug'>

	include /mixins.pug

	doctype html

	.Field.String(
		:class = 'class_object'
		@contextmenu = 'on_contextmenu'
		)

		//- @keypress.stop.prevent = ''
		//- @keyup.stop.prevent = ''
		//- @keydown.stop.prevent = ''
		.single_line_inputs_container(v-if='is_single_line')
			.grid-x
				.cell.auto
					input.raw_input(
						:value = 'raw_input'
						@keypress.stop = ''
						@keyup.stop = ''
						@keydown.stop = ''
						@change.stop = 'on_update_value'
						@blur.stop = 'on_update_value'
						type = 'text'
						:tabindex = 'tabindex'
						)
					input.expression_result(
						:value = 'value'
						readonly
						type = 'text'
						:tabindex = 'tabindex'
						)
				.cell.shrink(v-if = 'display_browse_button')
					.button.browse_button(
						@click = 'browse_file'
					) Browse Files
		.multiline_inputs_container(v-else)
			textarea.value(
				:rows = 'rows'
				@keypress.stop = ''
				@keyup.stop = ''
				@keydown.stop = ''
				@change.stop = 'on_update_value'
				@blur.stop = 'on_update_value'
				:tabindex = 'tabindex'
				) {{raw_input}}
			textarea.expression_result(
				:rows = 'rows'
				:tabindex = 'tabindex'
				readonly
				) {{result}}


</template>

<script lang='ts'>
// mixins
import {SetupFieldCommon, ISetupFieldCommonProps, SetupFieldCommonProps} from './mixins/FieldCommon';
import {SetupContextMenu} from '../mixins/ContextMenu';
import {StoreController} from '../../../../../store/controllers/StoreController';
import {StringParam} from '../../../../../../engine/params/String';
import {ParamSetCommand} from '../../../../../history/commands/ParamSet';

import {createComponent, computed} from '@vue/composition-api';
export default createComponent({
	name: 'string-field',
	props: SetupFieldCommonProps,
	// mixins: [Field, ContextMenu, TabIndexMixin, TabIndexMixin],

	setup(props: ISetupFieldCommonProps) {
		const param = StoreController.engine.param(props.json_param.graph_node_id)! as StringParam;
		const setup_field_common = SetupFieldCommon(props);

		const is_multiline = computed(() => {
			return param.options.is_multiline;
		});
		const is_single_line = computed(() => {
			return !is_multiline.value;
		});
		// input_tag_name: ->
		// 	if @is_multiline
		// 		'textarea'
		// 	else
		// 		'input'

		const rows = computed(() => {
			return 5;
		});

		const display_browse_button = computed(() => {
			return false; //POLY.desktop_controller().active();
		});

		// functions
		function on_update_value(e: Event) {
			const target = e.target as HTMLInputElement;
			if (target) {
				const new_value = target.value;
				const cmd = new ParamSetCommand(param, new_value);
				cmd.push();
			}
		}

		function browse_file() {
			// const file_type = this.param.desktop_browse_file_type();
			// const allowed_extensions = POLY.upload_allowed_extensions_by_file_type()[file_type];
			// const file_path = POLY.desktop_controller().browse_local_files(file_type, allowed_extensions);
			// if (file_path) {
			// 	const value = `\`local("${file_path}")\``;
			// 	return new History.Command.ParamSet(this.param, {value}).push(this);
			// }
		}

		return {
			is_multiline,
			is_single_line,
			rows,
			display_browse_button,
			// functions
			on_update_value,
			browse_file,
			// mixins
			...setup_field_common,
			...SetupContextMenu(props.json_param, param),
		};
	},
});
</script>

<style lang='sass'>
	@import "globals.sass"

	.Field.String
		input, textarea
			&.raw_input
				display: block
		input, textarea
			&.expression_result
				display: none
		&.displays_expression_result
			input, textarea
				&.raw_input
					display: none
			input, textarea
				&.expression_result
					display: block

		input, textarea
			margin: 0px
			&.has_expression
				&:not(.is_errored)
					background-color: mix($color_bg, lightgreen, 50%)
			&.is_errored
				background-color: $alert-color

		&.displays_expression_only
			input, textarea
				border: 0
				background-color: transparent
				box-shadow: none

		.browse_button
			margin-left: 10px

</style>
