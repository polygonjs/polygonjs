<template lang='pug'>

	include /pug/mixins.pug

	doctype html

	.Field.Button
		button.button.expanded(
			:style = 'style_object'
			@click.prevent = 'on_click'
			:tabindex = 'tabindex'
		) {{ json_param.name }}


</template>

<script lang='coffee'>

	# third party lib

	# internal lib

	# mixins
	import Field from './Field'
	import {TabIndexMixin} from './Mixin/TabIndex'

	export default component =
		name: 'button-field'
		mixins: [Field, TabIndexMixin]

		computed:
			style_object: ->
				backgroundColor: this.color
			color: ->
				this.param.color() || '#1779ba'

		methods:
			on_click: (e)->
				this.param.execute_callback()



</script>

<style lang='sass'>
	// @import "globals.sass"

	// .Field.Button

</style>
