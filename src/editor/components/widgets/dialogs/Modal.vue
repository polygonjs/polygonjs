

<template lang='pug'>
	
	.Polygon-Modal-Container
		.Polygon-Modal(:style = 'style_object')
			.grid-y.modal-grid
				.cell.shrink
					.Modal-title.text-center(
						@mousedown = 'on_move_start'
					) {{title}}
				.cell.auto.Modal-body
					slot

				.cell.shrink(v-if = 'resizable')
					.Modal-size-handle(
						@mousedown = 'on_resize_start'
					)


</template>

<script lang='ts'>
import {CoreDom} from 'src/core/Dom';
import {Vector2} from 'three/src/math/Vector2';

interface ModalProps {
	title: string;
	init_size: Vector2Like;
	resizable: boolean;
}

import {createComponent, ref, computed} from '@vue/composition-api';
export default createComponent({
	name: 'modal',

	props: {
		title: {
			type: String,
			default: 'No title',
		},
		init_size: {
			type: Object,
			default() {
				return {
					x: 300,
					y: 600,
				};
			},
		},
		resizable: {
			type: Boolean,
			default: true,
		},
	},

	setup(props: ModalProps) {
		const pos = ref({x: 100, y: 100});
		const size = ref({x: props.init_size.x, y: props.init_size.y});

		const style_object = computed(() => {
			return {
				top: `${pos.value.y}px`,
				left: `${pos.value.x}px`,
				width: `${size.value.x}px`,
				height: `${size.value.y}px`,
			};
		});

		//
		//
		// MOVE
		//
		//
		const start_mouse_pos = new Vector2();
		const start_pos = new Vector2();
		const current_mouse_pos = new Vector2();
		const delta = new Vector2();
		function on_move_start(e: MouseEvent) {
			start_mouse_pos.x = e.pageX;
			start_mouse_pos.y = e.pageY;

			start_pos.x = pos.value.x;
			start_pos.y = pos.value.y;

			CoreDom.add_drag_classes();
			document.addEventListener('mousemove', on_move_drag);
			document.addEventListener('mouseup', on_move_end);
		}

		function on_move_drag(e: MouseEvent) {
			current_mouse_pos.x = e.pageX;
			current_mouse_pos.y = e.pageY;
			delta.x = current_mouse_pos.x - start_mouse_pos.x;
			delta.y = current_mouse_pos.y - start_mouse_pos.y;

			pos.value.x = start_pos.x + delta.x;
			pos.value.y = start_pos.y + delta.y;
		}

		function on_move_end(e: MouseEvent) {
			document.removeEventListener('mousemove', on_move_drag);
			document.removeEventListener('mouseup', on_move_end);
			CoreDom.remove_drag_classes();
		}

		//
		//
		// RESIZE
		//
		//
		const start_size = new Vector2();
		function on_resize_start(e: MouseEvent) {
			start_mouse_pos.x = e.pageX;
			start_mouse_pos.y = e.pageY;

			start_size.x = size.value.x;
			start_size.y = size.value.y;

			// this._mouse_move_event_method = this.on_resize_drag.bind(this);
			// this._mouse_up_event_method = this.on_resize_end.bind(this);
			CoreDom.add_drag_classes();
			document.addEventListener('mousemove', on_resize_drag);
			document.addEventListener('mouseup', on_resize_end);
		}

		function on_resize_drag(e: MouseEvent) {
			current_mouse_pos.x = e.pageX;
			current_mouse_pos.y = e.pageY;

			delta.x = current_mouse_pos.x - start_mouse_pos.x;
			delta.y = current_mouse_pos.y - start_mouse_pos.y;

			size.value.x = start_size.x + delta.x;
			size.value.y = start_size.y + delta.y;
		}

		function on_resize_end(e: MouseEvent) {
			document.removeEventListener('mousemove', on_resize_drag);
			document.removeEventListener('mouseup', on_resize_end);
			CoreDom.remove_drag_classes();
		}

		// function to_json() {
		// 	return {
		// 		pos: {
		// 			x: this.pos.x,
		// 			y: this.pos.y
		// 		},
		// 		size: {
		// 			x: this.size.x,
		// 			y: this.size.y
		// 		}
		// 	};
		// }
		// function from_json(json){
		// 	if (json['pos'] != null) {
		// 		this.pos.x = json['pos'].x;
		// 		this.pos.y = json['pos'].y;
		// 	}
		// 	if (json['size'] != null) {
		// 		this.size.x = json['size'].x;
		// 		return this.size.y = json['size'].y;
		// 	}
		// }

		return {
			pos,
			style_object,
			on_move_drag,
			on_move_end,
			on_move_start,
			on_resize_drag,
			on_resize_end,
			on_resize_start,
		};
	},
});
</script>

<style lang='sass'>
	@import "globals.sass"

	.Polygon-Modal-Container
		position: relative
		width: 0px
		height: 0px
		top: 0px
		left: 0px
		.Polygon-Modal
			position: absolute
			z-index: 100
			border-radius: 5px
			border: 2px solid gray
			box-shadow: 5px 5px 5px lighten(black, 45%)
			background-color: $color_bg_modal
			.modal-grid
				height: 100%
				.Modal-title
					font-weight: bold
					cursor: pointer
					padding: 5px
					border-bottom: 1px solid grey
				.Modal-body
					max-height: 100%

				.Modal-size-handle
					height: 10px
					background-color: green
					cursor: se-resize

		

</style>
