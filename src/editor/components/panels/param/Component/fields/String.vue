<template lang='pug'>

	include /pug/mixins.pug

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
					input.value(
						:value = 'value_or_expression'
						@keypress.stop = ''
						@keyup.stop = ''
						@keydown.stop = ''
						@change.stop = 'on_update_value'
						@blur.stop = 'on_update_value'
						type = 'text'
						:tabindex = 'tabindex'
						)
					input.expression_result(
						:value = 'result'
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
				) {{value_or_expression}}
			textarea.expression_result(
				:rows = 'rows'
				:tabindex = 'tabindex'
				readonly
				) {{result}}


</template>

<script lang='coffee'>

	# third party lib

	# internal lib
	import History from 'src/Editor/History/_Module'

	# mixins
	import Field from './Field'
	import {ContextMenu} from '../Mixin/ContextMenu'
	import {TabIndexMixin} from './Mixin/TabIndex'

	export default component =
		name: 'string-field'
		mixins: [Field, ContextMenu, TabIndexMixin, TabIndexMixin]


		computed:
			is_multiline: ->
				this.param.is_multiline()
			is_single_line: ->
				!@is_multiline
			# input_tag_name: ->
			# 	if @is_multiline
			# 		'textarea'
			# 	else
			# 		'input'

			rows: ->
				5

			display_browse_button: ->
				POLY.desktop_controller().active()



		methods:
			on_update_value: (e)->
				new_value = e.target.value
				
				# if this.param.is_value_expression(new_value)
				# 	this.param.set_expression(new_value)
				# else
				# TODO: use a history command!
				# this.param.set(new_value)
				(new History.Command.ParamSet(this.param, {value: new_value})).push(this)

			browse_file: ()->
				file_type = this.param.desktop_browse_file_type()
				allowed_extensions = POLY.upload_allowed_extensions_by_file_type()[file_type]

				file_path = POLY.desktop_controller().browse_local_files(file_type, allowed_extensions)
				if file_path
					value = '`local("' + file_path + '")`'
					(new History.Command.ParamSet(this.param, {value: value})).push(this)



</script>

<style lang='sass'>
	@import "globals.sass"

	.Field.String
		input, textarea
			&.value
				display: block
		input, textarea
			&.expression_result
				display: none
		&.displays_expression_result
			input, textarea
				&.value
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
