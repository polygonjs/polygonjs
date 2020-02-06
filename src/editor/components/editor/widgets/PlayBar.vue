<template lang="pug">

	include /mixins.pug

	doctype html

	.Bar.Play
		.grid-x#play_bar
			// @mousemove = 'on_mouse_move'
			// @mouseup = 'on_mouse_up'
			// @mouseleave = 'on_mouse_leave'
			.cell.auto.play_bar_scrubber(
				ref = 'scrubber'
				@click = 'scrubber_set_frame'
				@mousedown = 'on_mouse_down'
				)
				.frame_indicator(
					:style = 'frame_indicator_style_object'
					)

			.cell.shrink
				.play_bar_buttons_container.grid-x

					.cell-shrink
						form(
							@submit.prevent.stop = ''
						)
							input(
								type='number'
								v-model.number='frame'
								)

					.cell-shrink.play_bar_buttons
						.button.tiny.disable-select(@click = 'decrement_frame')
							v-icon(
								name = 'angle-left'
							)
						.button.tiny.success.disable-select(@click = 'toggle_play_pause')
							v-icon(
								v-if = '!playing'
								name = 'play'
							)
							v-icon(
								v-else
								name = 'pause'
							)
						.button.tiny.disable-select(@click = 'increment_frame')
							v-icon(
								name = 'angle-right'
							)

					.cell-shrink.frame-range
						form(
							@submit.prevent.stop = ''
							)
							input(
								type='number'
								v-model.number='frame_range_start'
								)
							input(
								type='number'
								v-model.number='frame_range_end'
								:disabled = '!frame_range_end_locked'
								)
							input(
								type='checkbox'
								v-model='frame_range_end_locked'
								)
					//- .cell-shrink.fps
					//- 	form(
					//- 		@submit.prevent.stop = ''
					//- 		)
					//- 		input(
					//- 			type='number'
					//- 			v-model.number='fps'
					//- 			)

</template>

<script lang="ts">
import {CoreDom} from 'src/core/Dom';

import {createComponent, ref, computed} from '@vue/composition-api';
import {StoreController} from 'src/editor/store/controllers/StoreController';
export default createComponent({
	name: 'play_bar',

	// data: ->
	// 	mouse_dragging: false

	setup() {
		const scrubber = ref<HTMLElement>(null);

		const scrubber_width = computed(() => {
			return scrubber.value ? scrubber.value.offsetWidth : 0;
		});
		const frame = computed({
			get: () => StoreController.engine.frame(),
			set: (val) => StoreController.scene.set_frame(val),
		});
		const frame_range = computed(() => StoreController.engine.frame_range());
		const frame_range_locked = computed(() => StoreController.engine.frame_range_locked());

		const frame_range_start = computed({
			get: () => frame_range.value[0],
			set: (val) => StoreController.scene.time_controller.set_frame_range(val, frame_range.value[1]),
		});
		const frame_range_end = computed({
			get: () => frame_range.value[1],
			set: (val) => StoreController.scene.time_controller.set_frame_range(frame_range.value[0], val),
		});

		const frame_range_start_locked = computed({
			get: () => frame_range_locked.value[0],
			set: (val) =>
				StoreController.scene.time_controller.set_frame_range_locked(val, frame_range_locked.value[1]),
		});
		const frame_range_end_locked = computed({
			get: () => frame_range_locked.value[1],
			set: (val) =>
				StoreController.scene.time_controller.set_frame_range_locked(frame_range_locked.value[0], val),
		});
		const frames_count = computed(() => frame_range.value[1] - frame_range.value[0] + 1);

		const frame_indicator_style_object = computed(() => {
			const ratio = (frame.value - frame_range.value[0]) / (frames_count.value + 1);
			const percent = 100 * ratio;
			return {
				left: `${percent}%`,
			};
		});

		const playing = computed(() => StoreController.engine.playing_state());

		// functions
		function toggle_play_pause() {
			StoreController.scene.time_controller.toggle_play_pause();
		}
		function decrement_frame(e: MouseEvent) {
			if (e.ctrlKey) {
				StoreController.scene.set_frame(frame_range.value[0]);
			} else {
				StoreController.scene.time_controller.decrement_frame();
			}
		}
		function increment_frame(e: MouseEvent) {
			if (e.ctrlKey) {
				StoreController.scene.set_frame(frame_range.value[1]);
			} else {
				StoreController.scene.time_controller.increment_frame();
			}
		}

		function scrubber_set_frame(e: MouseEvent) {
			const ratio = e.clientX / scrubber_width.value;
			let frame = ratio * frames_count.value + frame_range.value[0];
			frame = Math.floor(frame);
			StoreController.scene.set_frame(frame);
		}
		function on_mouse_down() {
			// this.mouse_dragging = true
			CoreDom.add_drag_classes();
			document.addEventListener('mousemove', on_mouse_move);
			document.addEventListener('mouseup', on_mouse_up);
		}
		function on_mouse_up() {
			// this.mouse_dragging = false
			document.removeEventListener('mousemove', on_mouse_move);
			document.removeEventListener('mouseup', on_mouse_up);
			CoreDom.remove_drag_classes();
		}
		// on_mouse_leave: ->
		// 	# this.mouse_dragging = false
		function on_mouse_move(e: MouseEvent) {
			// if this.mouse_dragging
			scrubber_set_frame(e);
		}

		return {
			scrubber,
			scrubber_width,
			frame,
			frame_range,
			frame_range_locked,
			frame_range_start,
			frame_range_end,
			frame_range_start_locked,
			frame_range_end_locked,
			frames_count,
			frame_indicator_style_object,
			playing,

			// functions
			toggle_play_pause,
			decrement_frame,
			increment_frame,
			on_mouse_down,
			scrubber_set_frame,
		};
	},
});
</script>

<style lang="sass">
@import "globals.sass"

$color_play_bar_scrubber: lighten($color_bg, 25%)
$color_frame_indicator: lighten(mix($color_bg, $primary-color, 50%), 10%)
$color_frame_indicator_hover: lighten($color_frame_indicator, 5%)

.Bar.Play
	// background-color: $playbar_bg_color
	.button
		padding: 0.5em 1em

	.play_bar_scrubber
		position: relative
		cursor: pointer
		background-color: $color_play_bar_scrubber
		overflow: hidden
		.frame_indicator
			position: absolute
			top: 0px
			height: 100%
			min-width: 10px
			background-color: $color_frame_indicator
			&:hover
				background-color: $color_frame_indicator_hover

	.play_bar_buttons_container
		padding: 5px
		.play_bar_buttons
			margin: 0px 10px
	// .fps
	// 	margin-left: 10px

	input[type=number]
		display: inline-block
		margin-bottom: 0
		padding: 2px
		text-align: right
		height: auto
		width: 80px
	.frame-range
		input
			margin-left: 1px
</style>
