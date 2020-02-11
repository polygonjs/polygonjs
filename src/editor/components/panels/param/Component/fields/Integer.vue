<template lang='pug'>

	include /pug/mixins.pug

	doctype html

	.Field.Integer(
		:class = 'class_object'
		@contextmenu = 'on_contextmenu'
		)
		.grid-x
			.cell.auto
				//- @wheel.stop.prevent = 'on_wheel'
				//- @paste = 'on_paste'
				//- @mouseup = 'ensure_no_paste_from_middle_click'
				input.value(
					:class = 'input_value_class_object'
					:value = 'value_or_expression'
					@keypress.stop = ''
					@keyup.stop = ''
					@keydown.stop = ''
					@change.stop = 'on_update_value'
					@focus.stop = 'on_focus'
					@blur.stop = 'on_blur'
					type = 'text'
					@mousedown = 'open_numeric_slider'
					@paste = 'on_paste'
					@click.ctrl = 'reset_to_default'
					:title = 'error_message'
					:tabindex = 'tabindex'
					)
				input.expression_result(
					:value = 'result'
					readonly
					type = 'text'
					:title = 'result'
					:tabindex = 'tabindex'
					)

			.cell.small-10.slider_container(v-if = 'display_slider')
				input(
					type = 'range'
					:min = 'param_range[0]'
					:max = 'param_range[1]'
					:step = 'slider_step'
					:value = 'value_or_evaluated_expression'
					@change = 'create_history_command'
					@input = 'on_slider_drag'
					:tabindex = 'tabindex'
					)


</template>

<script lang='coffee'>

	# third party lib

	# internal lib
	import History from 'src/Editor/History/_Module'

	# mixins
	import Field from './Field'
	import GlobalSliderOwner from './Mixin/GlobalSliderOwner'
	import {ContextMenu} from '../Mixin/ContextMenu'
	import {TabIndexMixin} from './Mixin/TabIndex'

	export default component =
		name: 'integer-field'
		mixins: [Field, GlobalSliderOwner, ContextMenu, TabIndexMixin]

		data: ->
			text_input_focused: false

		computed:
			param_range: -> this.param.range()
			slider_step: -> 1
			value_or_evaluated_expression: ->
				# TODO: have the slider react to expression
				# TODO: have the slider disappear when we edit the expression
				@value
			display_slider: ->
				!this.text_input_focused

		methods:
			on_focus: ->
				if this.param.has_expression()
					this.text_input_focused = true
			on_blur: (e)->
				this.text_input_focused = false
				this.on_update_value(e)
			on_slider_drag: (e)->
				value = e.target.value
				this.param.set(value)

			create_history_command: (e)->
				(new History.Command.ParamSet(this.param, {value: e.target.value})).push(this)

</script>

<style lang='sass'>

	// .Field.Integer


</style>
