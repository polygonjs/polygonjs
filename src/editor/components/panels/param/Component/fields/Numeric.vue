<template lang='pug'>

	include /pug/mixins.pug

	doctype html

	.Field.Numeric(
		:class = 'class_object'
		@contextmenu = 'on_contextmenu'
		)
		//- @wheel.stop.prevent = 'on_wheel'
		//- @paste = 'on_paste'
		//- @mouseup = 'ensure_no_paste_from_middle_click'

		//- those events block were an attempt to prevent file save (as html)
		//- but they also prevent to write in the field, so not good
		//- and I still need to have them, otherwise copy pasting text also paste nodes
		//- and pressing space toggles play
		//- @keypress.stop.prevent = ''
		//- @keyup.stop.prevent = ''
		//- @keydown.stop.prevent = ''

		input.value(
			:class = 'input_value_class_object'
			:value = 'value_or_expression'
			@keypress.stop = ''
			@keyup.stop = ''
			@keydown.stop = ''
			@change.stop = 'on_update_value'
			@blur.stop = 'on_update_value'
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
		name: 'numeric-field'
		mixins: [Field, GlobalSliderOwner, ContextMenu, TabIndexMixin]





</script>

<style lang='sass'>
	

</style>
