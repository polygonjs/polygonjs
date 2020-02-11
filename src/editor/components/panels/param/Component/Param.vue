<template lang='pug'>

	include /pug/mixins.pug

	doctype html

	.ParamContainer.grid-x(
		v-if = 'param_visible'
		)
		.cell.small-3.text-right.param_name(
			:title = 'label_tooltip'
			@click = 'toggle_expression_mode'
			@mousedown = 'open_numeric_slider_if_numeric_or_color'
			@contextmenu = 'on_contextmenu'
		)
			label.disable-select(v-if = 'display_label') {{name}}

		.cell.small-9
			Component(
				:is="field_component_type"
				:json_param = 'json_param'
				:displays_expression_result = 'displays_expression_result'
				:tabindex = 'tabindex'
			)


</template>

<script lang='coffee'>

	# third party lib
	import lodash_isString from 'lodash/isString'

	# internal lib
	import {ParamType} from 'src/Engine/Param/_Module'

	# mixins
	import GlobalSliderOwner from './Field/Mixin/GlobalSliderOwner'
	import Emit from './Mixin/Emit'
	import {ContextMenu} from './Mixin/ContextMenu'

	# components
	import ButtonField from './Field/Button'
	import ColorField from './Field/Color'
	import FloatField from './Field/Float'
	import IntegerField from './Field/Integer'
	import NumericField from './Field/Numeric'
	import OperatorPathField from './Field/OperatorPath'
	import RadioField from './Field/Radio'
	import SeparatorField from './Field/Separator'
	import StringField from './Field/String'
	import ToggleField from './Field/Toggle'
	import VectorField from './Field/Vector'
	import Vector2Field from './Field/Vector2'
	import Vector4Field from './Field/Vector4'
	import RampField from './Field/Ramp'

	export default component =
		name: 'param-field-container'
		mixins: [Emit, GlobalSliderOwner, ContextMenu]
		components: {
			ButtonField
			ColorField
			FloatField
			IntegerField
			NumericField
			OperatorPathField
			RadioField
			SeparatorField
			StringField
			ToggleField
			VectorField
			Vector2Field
			Vector4Field
			RampField
		}

		props:
			json_param: {}
			description: {}
			tabindex: {
				default: -1,
				type: Number
			}

		data: ->
			displays_expression_result: false

		mounted: ->
			@param.update_visibility()

		watch:
			graph_node_id: ->
				@param.update_visibility()

		computed:
			graph_node_id: ->
				@json_param.graph_node_id
			param: ->
				this.$store.scene.graph().node_from_id(this.json_param?.graph_node_id)
			name: ->
				this.json_param.name
			type: ->
				this.json_param.type
			value: ->
				this.json_param.value
			human_description: ->
				if @description
					if lodash_isString(@description)
						@description
					else
						suffix = ''
						if @param && description_menu_entries = @description['menu_entries']
							entries_description = []
							@param.menu_entries().forEach (param_menu_entry)=>
								entry_name = param_menu_entry['name']
								description_entry = description_menu_entries[entry_name]
								entries_description.push( "- #{entry_name}:\n#{description_entry}" )
							suffix = '\n\n' + entries_description.join('\n\n')
						@description['description'] + suffix


			label_tooltip: ->
				if @human_description
					"#{@name}  (#{@type}: #{@human_description})"
				else
					"#{@name}  (#{@type})"

			field_component_type: ->
				converted_type = switch @type
					when 'integer'
						if this.param.has_menu_radio()
							'radio'
						else
							@type
					else
						@type

				"#{converted_type.replace('_', '-')}-field"

			param_visible: ->
				this.json_param.is_visible

			display_label: ->
				!this.param.is_label_hidden()




		methods:
			toggle_expression_mode: ->
				if this.param.has_expression()
					this.displays_expression_result = !this.displays_expression_result
				else
					this.displays_expression_result = false

			open_numeric_slider_if_numeric_or_color: (e)->
				if this.param.is_numeric() || this.param.type() == ParamType.COLOR
					this.open_numeric_slider(e)






</script>

<style lang='sass'>
	
	@import "globals.sass"

	$color_bg_hover: darken($color_bg_panel_param, 20%)
	$color_bg_expression: lighten(mix($color_bg, lightgreen, 50%), 20%)
	$color_bg_error: $alert-color

	.ParamContainer
		padding: 1px 0px
		overflow: hidden

		.param_menu_container
			position: relative
			height: 1px
			width: 100%
			background-color: red

		.param_name
			position: relative
			z-index: 1
			label
				font-size: 0.8rem
				color: $color_font
				cursor: pointer
				margin: 5px
				padding: 0rem 10px
				&:hover
					background-color: $color_bg_hover


		.Field
			position: relative
			z-index: 2
			input.value
				display: block
			input.expression_result
				display: none
			&.displays_expression_result
				input.value
					display: none
				input.expression_result
					display: block

			input, select
				margin: 0px
				padding: 0.2rem
				font-size: 0.8rem
				height: 2rem
				&.has_expression
					&:not(.is_errored)
						background-color: $color_bg_expression
				&.is_errored
					background-color: $color_bg_error

			.slider_container
				$handle_width: 16px
				$handle_height: 16px
				$handle_border_radius: 16px
				$handle_bg_color: $primary-color
				$handle_bg_color_hover: lighten($primary-color, 10%)
				// $handle_bg_white: url('/images/slider_handle.white.png')
				// $handle_bg_black: url('/images/slider_handle.black.png')
				// $handle_bg_size: $handle_height*1
				padding: 0px 10px
				input[type=range]
					width: 100%
					height: 100%
					padding: 0
					margin: 0
					// from: https://www.w3schools.com/howto/howto_js_rangeslider.asp
					-webkit-appearance: none  /* Override default CSS styles */
					appearance: none
					outline: none
					background-color: transparent
					
					// -webkit-transition: .2s
					// transition: opacity .2s
					// background-color: white
					&:hover
						&::-webkit-slider-thumb
							background-color: $handle_bg_color_hover
						&::-moz-range-thumb
							background-color: $handle_bg_color_hover
					&::-webkit-slider-thumb
						-webkit-appearance: none /* Override default look */
						appearance: none
						position: relative
						top: -7px
						width: $handle_width
						height: $handle_height
						border-radius: $handle_border_radius
						background-color: $handle_bg_color
						cursor: pointer
					&::-moz-range-thumb
						-webkit-appearance: none /* Override default look */
						appearance: none
						position: relative
						top: -7px
						width: $handle_width
						height: $handle_height
						border-radius: $handle_border_radius
						background-color: $handle_bg_color
						cursor: pointer
					&::-webkit-slider-runnable-track
						width: 100%
						height: 2px
						background: white
					&::-moz-range-track
						width: 100%
						height: 2px
						background: white


		.Field.Multiple.grid-x
			.cell
				.Field.Numeric
					padding-left: 2px

</style>
