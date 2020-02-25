<template lang="pug">

	include /mixins.pug

	doctype html

	.NetworkNodeInterractiveConnection
		svg(
			:style = 'svg_style_object'
			)
			line(
				:x1 = 'src_position.x'
				:y1 = 'src_position.y'
				:x2 = 'dest_position.x'
				:y2 = 'dest_position.y'
				)

</template>

<script lang="ts">
import {Vector2} from 'three/src/math/Vector2';
import {Box2} from 'three/src/math/Box2';

const PADDING = 10;
const DEFAULT_POINT_BOX_HALF_SIZE = new Vector2(PADDING, PADDING);
const DEFAULT_POINT_BOX = new Box2(DEFAULT_POINT_BOX_HALF_SIZE.clone().multiplyScalar(-1), DEFAULT_POINT_BOX_HALF_SIZE);

import {defineComponent, computed} from '@vue/composition-api';
export default defineComponent({
	name: 'network_node_interractive_connection',

	props: {
		mouse_start: {
			type: Object,
			default: () => {
				return {x: 0, y: 0};
			},
		},
		mouse_progress: {
			type: Object,
			default: () => {
				return {x: 0, y: 0};
			},
		},
	},

	setup(props) {
		const src_pos_vec = new Vector2();
		const dest_pos_vec = new Vector2();
		const src_box_box = DEFAULT_POINT_BOX.clone();
		const dest_box_box = DEFAULT_POINT_BOX.clone();
		const svg_bounds_box = new Box2();
		const src_position_vec = new Vector2();
		const dest_position_vec = new Vector2();
		const size = new Vector2();

		const src_pos = computed(() => {
			src_pos_vec.x = props.mouse_start.x;
			src_pos_vec.y = props.mouse_start.y;
			return src_pos_vec;
		});
		const dest_pos = computed(() => {
			dest_pos_vec.x = props.mouse_progress.x;
			dest_pos_vec.y = props.mouse_progress.y;
			return dest_pos_vec;
		});
		const src_box = computed(() => {
			src_box_box.copy(DEFAULT_POINT_BOX);
			src_box_box.translate(src_pos.value);
			return src_box_box;
		});
		const dest_box = computed(() => {
			dest_box_box.copy(DEFAULT_POINT_BOX);
			dest_box_box.translate(dest_pos.value);
			return dest_box_box;
		});
		const svg_bounds = computed(() => {
			svg_bounds_box.copy(src_box.value);
			svg_bounds_box.union(dest_box.value);
			return svg_bounds_box;
		});
		const src_position = computed(() => {
			src_position_vec.copy(src_pos.value);
			src_position_vec.sub(svg_bounds.value.min);
			return src_position_vec; //.add(DEFAULT_POINT_BOX_HALF_SIZE)
		});
		const dest_position = computed(() => {
			dest_position_vec.copy(dest_pos.value);
			dest_position_vec.sub(src_pos.value);
			dest_position_vec.add(src_position.value);
			return dest_position_vec;
			// const delta = this.dest_pos.clone().sub(this.src_pos);
			// return delta.add(this.src_position);
		});
		const svg_style_object = computed(() => {
			svg_bounds.value.getSize(size);
			const min = svg_bounds.value.min; //.clone();
			// min.sub(this.dest_json_node.ui_data)
			return {
				left: `${min.x}px`,
				top: `${min.y}px`,
				width: `${size.x}px`,
				height: `${size.y}px`,
			};
		});
		return {
			src_pos,
			dest_pos,
			src_box,
			dest_box,
			svg_bounds,
			src_position,
			dest_position,
			svg_style_object,
		};
	},
});
</script>

<style lang="sass">

@import "globals.sass"

.NetworkNodeInterractiveConnection
	position: absolute
	width: 0
	height: 0
	svg
		position: absolute
		pointer-events: none
		// background-color: green
		// opacity: 0.4
		// border: 1px solid black
		line
			stroke: $success-color
			stroke-width: 4
</style>
