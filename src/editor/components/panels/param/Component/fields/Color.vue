<template lang='pug'>

	include /pug/mixins.pug

	doctype html

	.Field.Multiple.Color.grid-x
		.cell.shrink
			input(
				type = 'color'
				name = "color_input_name"
				v-model = 'input_color'
				:tabindex = 'tabindex+1'
				)
		.cell.auto
			.grid-x
				.cell(
					v-for = 'json_component, i in json_components'
					:class = 'cell_class_object'
					:key = 'i'
					)
					Numeric(
					:json_param = 'json_component'
					:displays_expression_result = 'displays_expression_result'
					:tabindex = 'tabindex+1+i'
					)



</template>

<script lang='coffee'>

	# third party lib
	import {Color} from 'three/src/math/Color';
	THREE = {Color};

	# internal lib
	import History from 'src/Editor/History/_Module'

	# mixins
	import Field from './Field'
	import {TabIndexMixin} from './Mixin/TabIndex'
	
	# components
	import Numeric from './Numeric'

	export default component =
		name: 'color-field'
		mixins: [Field, TabIndexMixin]
		components: {Numeric}

		data: ->
			input_color: '#ff0000'

		mounted: ->
			this.update_input_color_from_param()

		computed:
			json_components: ->
				this.$store.getters['engine/json_param_components'](this.json_param)

			cell_class_object: ->
				columns_count_per_components = 12 / this.json_components.length
				class_name = "small-#{columns_count_per_components}"
				object = {}
				object[class_name] = true
				object

			color_input_name: ->
				"color_input_#{this.param.full_path()}"

		watch:
			input_color: (new_color)->
				
				if !this.param.has_expression()
					color = new THREE.Color(new_color)
					this.param.set(color.toArray())
			json_components: ->
				# TODO: that doesn't work when the color is more than 1
				#this.update_input_color_from_param()

		methods:
			update_input_color_from_param: ->
				this.param.eval().then (value)=>
					if value?
						@input_color = "##{value.getHexString()}"



</script>

<style lang='sass'>

	.Field.Color
		input[type=color]
			cursor: pointer
			width: 30px
			height: 100%
			padding: 0px
			margin-right: 5px

</style>
