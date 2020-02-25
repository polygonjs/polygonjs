<template lang="pug">

	include /mixins.pug

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

<script lang="ts">
import lodash_sortBy from 'lodash/sortBy';
import {Vector2} from 'three/src/math/Vector2';

// internal lib
import {CoreDom} from 'src/core/Dom';
import {EventHelper} from 'src/core/EventHelper';
import {RampValue, RampPointJson} from 'src/engine/params/ramp/RampValue';
import {RampParam} from 'src/engine/params/Ramp';

// mixins
import {SetupFieldCommon, ISetupFieldCommonProps, SetupFieldCommonProps} from './mixins/FieldCommon';
import {SetupContextMenu} from '../mixins/ContextMenu';
import {StoreController} from '../../../../../store/controllers/StoreController';
import {CoreMath} from '../../../../../../core/math/_Module';
import {ParamSetCommand} from '../../../../../history/commands/ParamSet';

import {defineComponent, computed, ref, onMounted, watch} from '@vue/composition-api';
export default defineComponent({
	name: 'ramp-field',
	props: SetupFieldCommonProps,
	// mixins: [Field, GlobalSliderOwner, ContextMenu, TabIndexMixin],
	setup(props: ISetupFieldCommonProps) {
		const param = StoreController.engine.param(props.json_param.graph_node_id)! as RampParam;
		const setup_field_common = SetupFieldCommon(props);

		const ramp_points = ref<RampPointJson[]>([]);
		const curve_points = ref<Vector2Like[]>([]);
		const interpolation = ref('');
		const dragged_point_index = ref(-1);
		const point_about_to_be_removed = ref(false);
		const svg = ref<HTMLElement | null>(null);

		const _start_normalized_mouse_pos = new Vector2();
		onMounted(() => {
			for (let point of param.value.points) {
				ramp_points.value.push(point.to_json());
			}
		});

		const control_point_positions_percent = computed(() => {
			return ramp_points.value.map((p) => {
				return `${100 * p.position}%`;
			});
		});
		const control_point_values_percent = computed(() => {
			return ramp_points.value.map((p) => {
				return `${100 * (1 - p.value)}%`;
			});
		});

		const curve_point_positions_percent = computed(() => {
			return curve_points.value.map((p) => {
				return `${100 * p.x}%`;
			});
		});
		const curve_point_values_percent = computed(() => {
			return curve_points.value.map((p) => {
				return `${100 * (1 - p.y)}%`;
			});
		});
		const control_point_class_objects = computed(() => {
			return ramp_points.value.map((p, i) => {
				if (dragged_point_index.value === i) {
					return {dragged: true};
				}
			});
		});
		const interpolated_curve_class_object = computed(() => {
			return {point_about_to_be_removed: point_about_to_be_removed.value};
		});

		watch(ramp_points, () => {
			update_curve();
		});

		// functions
		function update_curve() {
			const sorted_points = lodash_sortBy(ramp_points.value, (ramp_point) => ramp_point.position);
			const positions = new Float32Array(sorted_points.length);
			const values = new Float32Array(sorted_points.length);
			sorted_points.forEach(function(sorted_point, i) {
				positions[i] = sorted_point.position;
				values[i] = sorted_point.value;
			});

			const interpolant = RampParam.create_interpolant(positions, values);
			if (!svg.value || !svg.value.parentElement) {
				return;
			}
			const results_count = svg.value.parentElement.offsetWidth * 0.5;
			for (let i = 0; i < results_count; i++) {
				const i_n = i / results_count;
				const result = interpolant.evaluate(i_n);
				curve_points.value.push({
					x: i_n,
					y: result[0],
				});
			}
		}

		function add_point(e: MouseEvent) {
			if (!svg.value) {
				return;
			}
			EventHelper.normalized_position_0_1(e, svg.value, _start_normalized_mouse_pos);
			const new_position = _start_normalized_mouse_pos.x;
			let new_point_index = ramp_points.value.length - 1;

			ramp_points.value.forEach((ramp_point, i) => {
				if (ramp_point.position < new_position) {
					new_point_index = i;
				}
			});

			const new_json_point = {
				position: _start_normalized_mouse_pos.x,
				value: 1 - _start_normalized_mouse_pos.y, // not sure why 1+
			};
			ramp_points.value.splice(new_point_index + 1, 0, new_json_point);

			create_history_command();
		}

		// are_points_ordered: ->
		// 	prev_pos = -1
		// 	result = true
		// 	ramp_points.forEach (ramp_point, i)=>
		// 		if ramp_point.position <= prev_pos
		// 			result = false
		// 		prev_pos = ramp_point.position

		// 	result

		// reorder_points_if_required: ->
		// 	console.log("reorder_points_if_required", reorder_points_if_required)
		// 	if !are_points_ordered()
		// 		values_by_position = {}
		// 		ramp_points.forEach (ramp_point)->
		// 			values_by_position[ramp_point.position] = values_by_position[ramp_point.position] || []
		// 			values_by_position[ramp_point.position].push(ramp_point.value)
		// 		positions = Object.keys(values_by_position).map (p) ->
		// 			parseFloat(p)
		// 		positions = positions.sort()
		// 		console.log(positions)

		// 		new_ramp_points = []
		// 		positions.forEach (position)->
		// 			values = values_by_position[position]
		// 			values.forEach (value)->
		// 				new_ramp_points.push
		// 					position: position
		// 					value: value

		// 		console.log new_ramp_points.map (p)->
		// 			p.value
		// 		Vue.set(this, 'ramp_points', new_ramp_points)

		const _start_point_value: RampPointJson = {position: 0, value: 0};
		function on_point_move_start(e: MouseEvent, index: number) {
			if (!svg.value) {
				return;
			}
			dragged_point_index.value = index;
			EventHelper.normalized_position_0_1(e, svg.value, _start_normalized_mouse_pos);

			const point = ramp_points.value[dragged_point_index.value];
			if (point) {
				_start_point_value.position = point.position;
				_start_point_value.value = point.value;

				CoreDom.add_drag_classes();
				document.addEventListener('mousemove', on_pointmove_drag);
				document.addEventListener('mouseup', on_pointmove_end);
			}
		}
		const normalized_pos = new Vector2();
		function on_pointmove_drag(e: MouseEvent) {
			if (!svg.value) {
				return;
			}
			EventHelper.normalized_position_0_1(e, svg.value, normalized_pos);

			point_about_to_be_removed.value = pos_far_enough_to_remove_point(normalized_pos);

			const delta = {
				x: normalized_pos.x - _start_normalized_mouse_pos.x,
				y: normalized_pos.y - _start_normalized_mouse_pos.y,
			};

			const point = ramp_points.value[dragged_point_index.value];
			if (point) {
				point.position = CoreMath.clamp(_start_point_value.position + delta.x, 0, 1);
				point.value = CoreMath.clamp(_start_point_value.value - delta.y, 0, 1);
			}

			// reorder_points_if_required()
			update_curve();
		}

		const on_pointmove_end_normalized_pos = new Vector2();
		function on_pointmove_end(e: MouseEvent) {
			if (!svg.value) {
				return;
			}
			EventHelper.normalized_position_0_1(e, svg.value, on_pointmove_end_normalized_pos);

			// remove point if dragged outside
			if (pos_far_enough_to_remove_point(on_pointmove_end_normalized_pos)) {
				ramp_points.value.splice(dragged_point_index.value, 1);
			}

			dragged_point_index.value = -1;
			point_about_to_be_removed.value = false;
			document.removeEventListener('mousemove', on_pointmove_drag);
			document.removeEventListener('mouseup', on_pointmove_end);
			CoreDom.remove_drag_classes();
			create_history_command();
		}

		function pos_far_enough_to_remove_point(normalized_pos: Vector2Like) {
			const margin = 0.5;
			return (
				normalized_pos.x < -margin ||
				normalized_pos.x > 1 + margin ||
				normalized_pos.y < -margin ||
				normalized_pos.y > 1 + margin
			);
		}

		function create_history_command() {
			const value = RampValue.from_json({
				interpolation: interpolation.value,
				points: ramp_points.value,
			});
			const cmd = new ParamSetCommand(param, value);
			cmd.push();
		}

		return {
			svg,
			control_point_positions_percent,
			control_point_values_percent,
			curve_point_positions_percent,
			curve_point_values_percent,
			control_point_class_objects,
			interpolated_curve_class_object,
			// functions
			add_point,
			on_point_move_start,
			// mixins
			...setup_field_common,
			...SetupContextMenu(props.json_param, param),
		};
	},
});
</script>

<style lang="sass">

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
