<template lang='pug'>

	include /pug/mixins.pug

	doctype html

	.Field.Radio
		.radio_inputs_container
			select.select(
				ref = 'select'
				@change = 'set_from_select'
				:tabindex = 'tabindex'
				)
				option(
					v-for = 'entry, i in entries'
					:key = 'i'
					:value = 'entry.value'
					:selected = 'selected_states[i]'
				) {{entry.name}}
			// .radio_input_container(
			// 	v-for = 'entry, i in entries'
			// 	:key = 'i'

			// 	)
			// 	.grid-x
			// 		.cell.shrink
			// 			.switch
			// 				input.switch-input(
			// 					:id = 'radio_ids[i]'
			// 					type= 'checkbox'
			// 					@change = 'set_from_radio(i)'
			// 					:checked = 'radio_checked_statuses[i]'
			// 				)
			// 				label.switch-paddle(
			// 					:style = 'style_objects[i]'
			// 					:for='radio_ids[i]'
			// 				)
			// 		.cell.auto
			// 			label(
			// 				:for = 'radio_ids[i]'
			// 				@click = 'set_from_radio(i)'
			// 			) {{entry.name}}

			//- input(
			//- 	:name = 'radio_name'
			//- 		type = 'radio'
			//- 	:id = 'radio_ids[i]'
			//- 	:value = 'entry.value'
			//- 	:checked = 'radio_checked_statuses[i]'
			//- 	@click = 'set_from_radio(i)'
			//- )



</template>

<script lang='coffee'>

	# third party lib
	import lodash_map from 'lodash/map'

	# internal lib
	import History from 'src/Editor/History/_Module'

	# mixins
	import Field from './Field'
	import {TabIndexMixin} from './Mixin/TabIndex'

	export default component =
		name: 'radio-field'
		mixins: [Field, TabIndexMixin]

		data: ->
			unique_id: "param_menu_#{Math.round(Math.random()*10000000)}"

		computed:
			entries: ->
				this.param.menu_entries()
			selected_states: ->
				@entries.map (entry)=>
					entry.value == this.param.value()
			# radio_name: ->
			# 	"#{this.param.full_path()}_#{this.unique_id}"
			# radio_ids: ->
			# 	lodash_map this.entries, (entry, i)=>
			# 		"#{this.param.full_path()}_#{i}_#{this.unique_id}"
			# radio_checked_statuses: ->
			# 	lodash_map this.entries, (entry, i)=>
			# 		entry.value == this.param.value()
			# checked_color: ->
			# 	this.param.color() || '#1779ba'
			# default_color: ->
			# 	'#cacaca'

			# style_objects: ->
			# 	lodash_map this.entries, (entry, i)=>
			# 		# color = if entry.value == this.param.value()
			# 		# 	this.checked_color
			# 		# else
			# 		# 	this.default_color

			# 		style =
			# 			backgroundColor: this.checked_color
			# 			opacity: if (entry.value == this.param.value()) then 1 else 0.25


		methods:
			set_from_select: ->
				value = this.$refs.select.value
				(new History.Command.ParamSet(this.param, {value: value})).push(this)
			# set_from_radio: (index)->
			# 	entry = this.entries[index]
			# 	value = entry['value']
			# 	(new History.Command.ParamSet(this.param, {value: value})).push(this)



</script>

<style lang='sass'>

	.Field.Radio
		input, label
			cursor: pointer

		// .switch
		// 	padding:
		// 		top: 3px
		// 		right: 5px

		select.select
			margin-bottom: 0

		label
			padding:
				top: 5px
				left: 10px


</style>
