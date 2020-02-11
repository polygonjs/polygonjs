<template lang='pug'>

	include /pug/mixins.pug

	doctype html

	.Field.Toggle.grid-x(
		:class = 'class_object'
		@contextmenu = 'on_contextmenu'
		)
		.cell.shrink
			input(
				type = 'checkbox'
				@change = 'on_checkbox_update'
				:checked = 'param_result'
				:tabindex = 'tabindex'
			)
			//- .switch
			//- 	input.switch-input(
			//- 		:id = 'checkbox_id'
			//- 		type= 'checkbox'
			//- 		@change = 'on_checkbox_update'
			//- 		:checked = 'param_result'
			//- 	)
			//- 	label.switch-paddle.disable-select(
			//- 		:for="checkbox_id"
			//- 		:style='style_object'
			//- 	)
		.cell.auto
			Numeric(
				v-if = 'is_field_visible'
				:json_param = 'json_param'
				:displays_expression_result = 'displays_expression_result'
				:tabindex = 'tabindex+1'
			)
			label.disable-select(
				v-else
				@click = 'toggle_param'
			) {{name}}


</template>

<script lang='coffee'>

	# third party lib

	# internal lib
	import History from 'src/Editor/History/_Module'

	# mixins
	import Field from './Field'
	import {ContextMenu} from '../Mixin/ContextMenu'
	import {TabIndexMixin} from './Mixin/TabIndex'

	# components
	import Numeric from './Numeric'

	export default component =
		name: 'toggle-field'
		mixins: [Field, ContextMenu, TabIndexMixin]
		components: {Numeric}

		data: ->
			param_result:
				type: Boolean
				default: false

		mounted: ->
			this.eval_param()

		computed:
			checkbox_id: ->
				"checkbox_#{this.json_param.graph_node_id}"
			checked_color: ->
				this.param.color() || '#1779ba'
			default_color: ->
				'#cacaca'
			checked: ->
				this.param_result
			style_object: ->
				style =
					backgroundColor: this.checked_color
					opacity: if this.checked then 1 else 0.3

		watch:
			value: (new_value)->
				this.param_result = this.param.value_to_boolean(new_value)
			expression: (new_value)->
				this.eval_param()


		methods:
			on_checkbox_update: (e)->
				new_value = e.target.checked
				new_value = if new_value
					1
				else
					0

				(new History.Command.ParamSet(this.param, {value: new_value})).push(this)

			toggle_param: ->
				new_value = !this.param.value()
				new_value = if new_value
					1
				else
					0
				(new History.Command.ParamSet(this.param, {value: new_value})).push(this)

			eval_param: ->
				this.param.eval().then (value)=>
					this.param_result = this.param.value_to_boolean(value)





</script>

<style lang='sass'>
	@import "globals.sass"

	.Field.Toggle
		input.value
			display: block
		input.expression_result
			display: none
		&.displays_expression_result
			input.value
				display: none
			input.expression_result
				display: block

		input
			margin: 0px
			&.has_expression
				background-color: mix($color_bg, lightgreen, 50%)

		input[type=checkbox]
			// margin-top: 13px
			$checkbox_scale: 1.4
			cursor: pointer
			-ms-transform: scale($checkbox_scale) /* IE */
			-moz-transform: scale($checkbox_scale) /* FF */
			-webkit-transform: scale($checkbox_scale) /* Safari and Chrome */
			-o-transform: scale($checkbox_scale) /* Opera */
			transform: scale($checkbox_scale)
			// padding: 10px;
			margin-right: 5px
			position: relative
			top: 2px

		label
			padding: 5px
			cursor: pointer

		// .switch
		// 	margin-bottom: 0px
		// 	padding:
		// 		// top: 3px
		// 		right: 5px

</style>
