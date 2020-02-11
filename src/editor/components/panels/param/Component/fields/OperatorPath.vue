<template lang='pug'>

	include /pug/mixins.pug

	doctype html

	.Field.OperatorPath(
		:class = 'class_object'
		@contextmenu = 'on_contextmenu'
		)
		.grid-x
			.cell.auto

				input.value(
					:value = 'value'
					@keypress.stop = ''
					@keyup.stop = ''
					@keydown.stop = ''
					@change.stop = 'on_update_value'
					@blue.stop = 'on_update_value'
					type = 'text'
					:tabindex = 'tabindex'
					)
				input.expression_result(
					:value = 'result'
					readonly
					type = 'text'
					:tabindex = 'tabindex'
					)

			.cell.shrink
				.button-group
					.button.tiny.primary(
						title = 'go to node'
						@click = 'go_to_node'
						)
						v-icon(name = "angle-double-right")
					.button.tiny.warning(
						title = 'select node'
						@click = 'open_node_selector'
						)
						v-icon(name = "align-left")


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
		name: 'operator-path-field'
		mixins: [Field, ContextMenu, TabIndexMixin]

		methods:
			on_update_value: (e)->
				new_value = e.target.value
				
				if this.param.is_value_expression(new_value)
					this.param.set_expression(new_value)
				else
					this.param.set(new_value)


			go_to_node: ->
				await this.param.eval()
				node = this.param.found_node()
				if node? && (parent = node.parent())?
					#this.$store.app.open_node(parent)
					this.$store.commit 'editor/current_node', parent

					parent.selection().set(node)

			open_node_selector: ->

				this.$store.commit 'editor/param_node_selector/open',
					param_id: this.param.graph_node_id()






</script>

<style lang='sass'>
	@import "globals.sass"

	.Field.OperatorPath
		.button-group
			position: relative
			top: 1px
			margin-right: 5px
			.button
				margin-left: 5px

</style>
