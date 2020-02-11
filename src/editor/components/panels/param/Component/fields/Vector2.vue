<template lang='pug'>

	include /pug/mixins.pug

	doctype html

	.Field.Multiple.Vector.grid-x
		.cell(
			v-for = 'json_component, i in json_components'
			:class = 'cell_class_object'
			:key = 'i'
		)
			Numeric(
				:json_param = 'json_component'
				:displays_expression_result = 'displays_expression_result'
				:tabindex = 'tabindex+i'
			)



</template>

<script lang='coffee'>

	# third party lib

	# internal lib
	import History from 'src/Editor/History/_Module'

	# mixins
	import Field from './Field'
	import {TabIndexMixin} from './Mixin/TabIndex'
	
	# components
	import Numeric from './Numeric'

	export default component =
		name: 'vector2-field'
		mixins: [Field, TabIndexMixin]
		components: {Numeric}

		computed:
			json_components: ->
				this.$store.getters['engine/json_param_components'](this.json_param)

			cell_class_object: ->
				columns_count_per_components = 12 / this.json_components.length
				class_name = "small-#{columns_count_per_components}"
				object = {}
				object[class_name] = true
				object


</script>

<style lang='sass'>

	// .Field.Vector

</style>
