<template lang='pug'>

	include /mixins.pug

	doctype html

	.NetworkNodeConnection
		svg(
			:style = 'svg_style_object'
			)
			line(
				:class = 'line_class_object'
				:x1 = 'src_position.x'
				:y1 = 'src_position.y'
				:x2 = 'dest_position.x'
				:y2 = 'dest_position.y'
				)

</template>

<script lang='ts'>
//# third party lib
import {Vector2} from 'three/src/math/Vector2';
import {Box2} from 'three/src/math/Box2';

import {Constants} from '../helpers/Constants';
import {BaseNodeType} from 'src/engine/nodes/_Base';

interface ConnectionProps {
	src_json_node: EngineNodeData;
	dest_json_node: EngineNodeData;
	input_index: number;
	output_index: number;
}

import {StoreController} from '../../../../store/controllers/StoreController';
import {EngineNodeData} from '../../../../store/modules/Engine';
import {createComponent, computed, Ref} from '@vue/composition-api';
export default createComponent({
	name: 'network_node_connection',

	props: {
		src_json_node: {},
		dest_json_node: {},
		input_index: Number,
		output_index: Number,
	},

	setup(props: ConnectionProps) {
		const src_node = StoreController.engine.node(props.src_json_node.graph_node_id)!;
		const dest_node = StoreController.engine.node(props.dest_json_node.graph_node_id)!;

		const is_src_not_cloned: Readonly<Ref<boolean>> = computed(() => {
			return !props.dest_json_node.inputs_clonable_state_with_override[props.input_index];
		});
		const layout_vertical: Readonly<Ref<boolean>> = computed(() => {
			return src_node.ui_data.is_layout_vertical();
		});
		const src_node_pos_v = new Vector2();
		const dest_node_pos_v = new Vector2();
		const src_node_pos = computed(() => {
			src_node_pos_v.x = props.src_json_node.ui_data.x;
			src_node_pos_v.y = props.src_json_node.ui_data.y;
			return src_node_pos_v;
		});
		const dest_node_pos = computed(() => {
			dest_node_pos_v.x = props.dest_json_node.ui_data.x;
			dest_node_pos_v.y = props.dest_json_node.ui_data.y;
			return dest_node_pos_v;
		});
		// const src_node_box_in_place = computed(() => node_box_in_place(src_node));
		// const dest_node_box_in_place = computed(() => node_box_in_place(dest_node));
		const src_node_height = computed(() => node_height(src_node));
		const dest_node_height = computed(() => node_height(dest_node));
		// src_node_width(){ return node_width(src_node) },
		// dest_node_width(){ return node_width(dest_node) },
		const src_node_box = computed(() => node_box(props.src_json_node));
		const dest_node_box = computed(() => node_box(props.dest_json_node));
		const dest_node_inputs_count = computed(() => dest_node.io.inputs.max_inputs_count);
		const dest_node_width = computed(() => dest_node.ui_data.width());
		const svg_bounds = computed(() => src_node_box.value.clone().union(dest_node_box.value));
		const src_position = computed(() => {
			if (props.src_json_node) {
				const node_delta = src_node_pos.value.clone().sub(svg_bounds.value.min);

				if (layout_vertical) {
					const connection_pos = new Vector2(
						0,
						0.5 * src_node_height.value +
							Constants.CONNECTION_VERTICAL_MARGIN -
							2 * Constants.CONNECTION_VERTICAL_MARGIN
					);
					return node_delta.add(connection_pos);
				} else {
					const connection_pos = new Vector2(
						0.5 * dest_node_width.value + Constants.CONNECTION_VERTICAL_MARGIN,
						-0.5 * Constants.NODE_HEIGHT +
							Constants.CONNECTION_VERTICAL_START +
							props.output_index * Constants.CONNECTION_VERTICAL_SPACING
					);
					return node_delta.add(connection_pos);
				}
			}
		});
		const dest_position = computed(() => {
			if (props.dest_json_node) {
				const node_delta = dest_node_pos.value.clone().sub(svg_bounds.value.min);
				if (layout_vertical) {
					let connection_x = 0;
					if (dest_node_inputs_count.value > 0) {
						const interval_size = dest_node_width.value / (dest_node_inputs_count.value + 1);
						connection_x = -0.5 * dest_node_width.value + (props.input_index + 1) * interval_size;
					}
					const connection_pos = new Vector2(
						connection_x,
						-0.5 * dest_node_height.value + Constants.CONNECTION_VERTICAL_MARGIN
					);
					return node_delta.add(connection_pos);
				} else {
					const connection_pos = new Vector2(
						-0.5 * dest_node_width.value - Constants.CONNECTION_VERTICAL_MARGIN,
						-0.5 * Constants.NODE_HEIGHT +
							Constants.CONNECTION_VERTICAL_START +
							props.input_index * Constants.CONNECTION_VERTICAL_SPACING
					);
					return node_delta.add(connection_pos);
				}
			}
		});
		// delta(){
		// 	return {
		// 		x: (src_position.x - dest_position.x),
		// 		y: (src_position.y - dest_position.y)
		// 	}
		// },
		// size(){
		// 	return {
		// 		x: Math.abs(delta.x),
		// 		y: Math.abs(delta.y)
		// 	}
		// },
		// svg_src_point(){
		// 	return {
		// 		x: 0.5*Constants.NODE_UNIT + (delta.x < 0 ? delta.x : 0),
		// 		y: -6+(delta.y < 0 ? delta.y : 0),
		// 	}
		// },
		// line_src_point(){
		// 	return {
		// 		x: PADDING+(delta.x < 0 ? 0 : size.x),
		// 		y: PADDING+(delta.y < 0 ? 0 : size.y),
		// 	}
		// },
		const svg_style_object = computed(() => {
			const size = new Vector2();
			svg_bounds.value.getSize(size);
			const min = svg_bounds.value.min.clone();
			min.x -= props.dest_json_node.ui_data.x;
			min.y -= props.dest_json_node.ui_data.y;
			return {
				left: `${min.x}px`,
				top: `${min.y}px`,
				width: `${size.x}px`,
				height: `${size.y}px`,
			};
		});
		const line_class_object = computed(() => {
			const obj: Dictionary<boolean> = {};
			if (dest_node.io.inputs.has_named_inputs) {
				const named_input = props.src_json_node.named_outputs[props.output_index];
				const named_output = props.dest_json_node.named_inputs[props.input_index];
				if (named_input.type != named_output.type) {
					return {mismatched_types: true};
				} else {
					obj[named_input.type] = true;
				}
			}

			if (is_src_not_cloned) {
				obj['is_src_not_cloned'] = true;
			}

			return obj;
		});

		// functions
		function node_from_json(json: EngineNodeData): BaseNodeType {
			return StoreController.engine.node(json.graph_node_id)!;
		}
		function node_box_in_place(node: BaseNodeType): Box2 {
			const ui_data = node.ui_data;
			const width = ui_data.width();
			let connections_height = 0;
			if (!layout_vertical.value) {
				const max_outputs_count = Math.max(
					node.io.inputs.named_input_connection_points.length,
					node.io.outputs.named_output_connection_points.length
				);
				connections_height =
					Constants.CONNECTION_VERTICAL_START + max_outputs_count * Constants.CONNECTION_VERTICAL_SPACING;
			}
			const node_height = Math.max(Constants.NODE_HEIGHT, connections_height);
			const delta = new Vector2(
				0.5 * width + 2 * Constants.CONNECTION_VERTICAL_MARGIN,
				0.5 * node_height + 2 * Constants.CONNECTION_VERTICAL_MARGIN
			);
			return new Box2(delta.clone().multiplyScalar(-1), delta);
		}
		function node_height(node: BaseNodeType): number {
			const box = node_box_in_place(node);
			const size = new Vector2();
			box.getSize(size);
			return size.y;
		}
		// function node_width(node: BaseNodeType): number {
		// 	const box = node_box_in_place(node);
		// 	const size = new Vector2();
		// 	box.getSize(size);
		// 	return size.x;
		// }
		const node_box_v = new Vector2();
		function node_box(json_node: EngineNodeData): Box2 {
			const node = node_from_json(json_node);
			node_box_v.x = json_node.ui_data.x;
			node_box_v.y = json_node.ui_data.y;
			return node_box_in_place(node).translate(node_box_v);
		}

		return {
			svg_style_object,
			line_class_object,
			src_position,
			dest_position,
		};
	},
});
</script>

<style lang='sass'>

	@import "globals.sass"
	$color_connection: $primary-color
	$color_connection_hover: lighten($color_connection, 5%)
	$connection_size: 2px
	$connection_size_hover: 4px

	$color_connection_no_clone: purple //mix($p	rimary-color, $success-color, 75%)
	$connection_size_no_clone: 3*$connection_size
	$color_connection_hover_no_clone: lighten($color_connection_no_clone, 5%)

	.NetworkNodeConnection
		position: absolute
		width: 0
		height: 0
		svg
			position: absolute
			pointer-events: none
			// background-color: lighten(green, 25%)
			// opacity: 0.4
			// border: 1px solid black
			line
				pointer-events: auto
				// cursor: pointer
				stroke: $color_connection
				stroke-width: $connection_size
				&.is_src_not_cloned
					stroke: $color_connection_no_clone
					stroke-width: $connection_size_no_clone
					&:hover
						stroke: $color_connection_hover_no_clone
				&:hover
					stroke: $color_connection_hover
					// stroke-width: $connection_size_hover
				&.mismatched_types
					stroke: $alert-color
					stroke-width: 3*$connection_size
				&.bool
					stroke: $color_connection_bool
				&.int
					stroke: $color_connection_int
				&.float
					stroke: $color_connection_float
				&.vec2
					stroke: $color_connection_vec2
				&.vec3
					stroke: $color_connection_vec3
				&.vec4
					stroke: $color_connection_vec4
				&.mat3
					stroke: $color_connection_mat3




</style>
