<template lang='pug'>

	include /pug/mixins.pug

	doctype html

	.Field.Ramp(
		:class = 'class_object'
		@contextmenu = 'on_contextmenu'
		)
		.grid-x
			.cell.auto
				.points_container
					svg(
						ref = 'svg'
						@click = 'add_point'
						)
						circle.interpolated_curve_point(
							v-for = 'curve_point, i in curve_points'
							:class = 'interpolated_curve_class_object'
							:cx='curve_point_positions_percent[i]'
							:cy='curve_point_values_percent[i]'
						)
						circle.control_point(
							v-for = 'ramp_point, i in ramp_points'
							:class = 'control_point_class_objects[i]'
							:cx='control_point_positions_percent[i]'
							:cy='control_point_values_percent[i]'
							@mousedown.stop = 'on_point_move_start($event, i)'
							@click.stop = ''
						)




</template>

<script lang='coffee'>

	# third party lib
	import lodash_clamp from 'lodash/clamp'
	import lodash_times from 'lodash/times'
	import lodash_sortBy from 'lodash/sortBy'
	import Vue from 'vue'
	import {Vector2} from 'three/src/math/Vector2'
	THREE = {Vector2}

	# internal lib
	import History from 'src/Editor/History/_Module'
	import {CoreDom} from 'src/Core/Dom'
	import {EventHelper} from 'src/Core/EventHelper'
	import {RampValue} from 'src/Engine/Param/Ramp/RampValue'
	import {Ramp} from 'src/Engine/Param/Ramp'

	# mixins
	import Field from './Field'
	import GlobalSliderOwner from './Mixin/GlobalSliderOwner'
	import {ContextMenu} from '../Mixin/ContextMenu'
	import {TabIndexMixin} from './Mixin/TabIndex'

	export default component =
		name: 'float-field'
		mixins: [Field, GlobalSliderOwner, ContextMenu, TabIndexMixin]

		data: ->
			ramp_points: []
			curve_points: []
			interpolation: ''
			dragged_point_index: -1
			point_about_to_be_removed: false

		mounted: ->
			@_start_normalized_mouse_pos = new THREE.Vector2()
			value = this.param.value()
			points = value.points()
			json = points.map (p)=>
				p.to_json()
			Vue.set(this, 'ramp_points', json )

		watch:
			ramp_points: ->
				this.$nextTick =>
					this.update_curve()
		# 		# deep:true # I never know if that works in coffeescript

		computed:
			control_point_positions_percent: ->
				this.ramp_points.map (p)=>
					"#{100*p.position}%"
			control_point_values_percent: ->
				this.ramp_points.map (p)=>
					"#{100*(1-p.value)}%"

			curve_point_positions_percent: ->
				this.curve_points.map (p)=>
					"#{100*p.x}%"
			curve_point_values_percent: ->
				this.curve_points.map (p)=>
					"#{100*(1-p.y)}%"
			control_point_class_objects: ->
				this.ramp_points.map (p, i)=>
					if @dragged_point_index == i
						dragged: true
			interpolated_curve_class_object: ->
				point_about_to_be_removed: @point_about_to_be_removed


		methods:
			update_curve: ->
				sorted_points = lodash_sortBy this.ramp_points, (ramp_point)->
					ramp_point.position
				positions = new Float32Array( sorted_points.length )
				values = new Float32Array( sorted_points.length )
				sorted_points.forEach (sorted_point, i)->
					positions[i] = sorted_point.position
					values[i] = sorted_point.value

				interpolant = Ramp.create_interpolant(positions, values)
				results_count = this.$refs.svg.parentElement.offsetWidth*0.5
				curve_points = []
				lodash_times results_count, (i)->
					i_n = i / results_count
					result = interpolant.evaluate(i_n)
					curve_points.push
						x: i_n
						y: result[0]
				Vue.set(this, 'curve_points', curve_points)

			add_point: (e)->
				EventHelper.normalized_position_0_1(e, this.$refs.svg, @_start_normalized_mouse_pos)
				new_position = @_start_normalized_mouse_pos.x
				new_point_index = this.ramp_points.length-1

				this.ramp_points.forEach (ramp_point, i)=>
					if ramp_point.position < new_position
						new_point_index = i

				new_json_point =
					position: @_start_normalized_mouse_pos.x
					value: 1-@_start_normalized_mouse_pos.y # not sure why 1+
				this.ramp_points.splice( new_point_index+1, 0, new_json_point)

				this.create_history_command()

			# are_points_ordered: ->
			# 	prev_pos = -1
			# 	result = true
			# 	this.ramp_points.forEach (ramp_point, i)=>
			# 		if ramp_point.position <= prev_pos
			# 			result = false
			# 		prev_pos = ramp_point.position

			# 	result

			# reorder_points_if_required: ->
			# 	console.log("reorder_points_if_required", reorder_points_if_required)
			# 	if !this.are_points_ordered()
			# 		values_by_position = {}
			# 		this.ramp_points.forEach (ramp_point)->
			# 			values_by_position[ramp_point.position] = values_by_position[ramp_point.position] || []
			# 			values_by_position[ramp_point.position].push(ramp_point.value)
			# 		positions = Object.keys(values_by_position).map (p) ->
			# 			parseFloat(p)
			# 		positions = positions.sort()
			# 		console.log(positions)

			# 		new_ramp_points = []
			# 		positions.forEach (position)->
			# 			values = values_by_position[position]
			# 			values.forEach (value)->
			# 				new_ramp_points.push
			# 					position: position
			# 					value: value

			# 		console.log new_ramp_points.map (p)->
			# 			p.value
			# 		Vue.set(this, 'ramp_points', new_ramp_points)


			on_point_move_start: (e, index)->
				@dragged_point_index = index
				EventHelper.normalized_position_0_1(e, this.$refs.svg, @_start_normalized_mouse_pos)

				point = this.ramp_points[@dragged_point_index]
				if point
					@_start_point_value =
						position: point.position
						value: point.value

					@_mouse_move_event_method = this.on_pointmove_drag.bind(this)
					@_mouse_up_event_method = this.on_pointmove_end.bind(this)
					CoreDom.add_drag_classes()
					document.addEventListener 'mousemove', @_mouse_move_event_method
					document.addEventListener 'mouseup', @_mouse_up_event_method
			on_pointmove_drag: (e)->
				normalized_pos = new THREE.Vector2()
				EventHelper.normalized_position_0_1(e, this.$refs.svg, normalized_pos)

				@point_about_to_be_removed = this.pos_far_enough_to_remove_point(normalized_pos)

				delta =
					x: normalized_pos.x - @_start_normalized_mouse_pos.x
					y: normalized_pos.y - @_start_normalized_mouse_pos.y

				point = this.ramp_points[@dragged_point_index]
				if point
					point.position = lodash_clamp(@_start_point_value.position + delta.x, 0, 1)
					point.value = lodash_clamp(@_start_point_value.value - delta.y, 0, 1)

				# this.reorder_points_if_required()
				this.update_curve()

			on_pointmove_end: (e)->
				normalized_pos = new THREE.Vector2()
				EventHelper.normalized_position_0_1(e, this.$refs.svg, normalized_pos)

				# remove point if dragged outside
				if this.pos_far_enough_to_remove_point(normalized_pos)
					this.ramp_points.splice( @dragged_point_index, 1 )

				@dragged_point_index = -1
				@point_about_to_be_removed = false
				document.removeEventListener 'mousemove', @_mouse_move_event_method
				document.removeEventListener 'mouseup', @_mouse_up_event_method
				CoreDom.remove_drag_classes()
				this.create_history_command()

			pos_far_enough_to_remove_point: (normalized_pos)->
				margin = 0.5
				(normalized_pos.x < -margin) || (normalized_pos.x > 1+margin) || (normalized_pos.y < -margin) || (normalized_pos.y > 1+margin)

			create_history_command: ->
				value = RampValue.from_json
					interpolation: this.interpolation
					points: this.ramp_points
				(new History.Command.ParamSet(this.param, {value: value})).push(this)


</script>

<style lang='sass'>

	.Field.Ramp
		.points_container
			background-color: white
			svg
				display: block // to remove space under it
				height: 160px
				width: 100%
				circle.control_point
					r: 5
					stroke: black
					stroke-width: 1
					fill: grey
					cursor: pointer
					&:hover, &.dragged
						stroke-width: 2
						fill: lightgrey
				circle.interpolated_curve_point
					r: 2
					fill: black
					&.point_about_to_be_removed
						fill: red




</style>
