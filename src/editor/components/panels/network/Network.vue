<template lang="pug">

	include /mixins.pug

	doctype html


	.Panel.Viewer.full_height_container.grid-y
		span Network
		//- .cell.shrink.viewer_top_bar(
		//- 	v-if = '!player_mode'
		//- 	)
		//- 	.grid-x
		//- 		.cell.shrink
		//- 			DropDownMenu(
		//- 				:label = 'camera_menu_label'
		//- 				:entries = 'camera_menu_entries'
		//- 				:sort_entries = 'true'
		//- 				@select = 'on_select_camera_menu_entry_select'
		//- 			)
		//- 		.cell.auto
		//- 		.cell.shrink.text-right(v-if = 'scene_update_allowed')
		//- 			DropDownMenu(
		//- 				v-if = '!capture.active'
		//- 				label = 'capture'
		//- 				:entries = 'capture_menu_entries'
		//- 				@select = 'on_capture_menu_entry_select'
		//- 				:right_aligned = 'true'
		//- 			)

		//- .cell.auto.viewers_container(
		//- 	ref = 'viewer_container'
		//- 	)
		//- 	ThreejsViewer(
		//- 		:capture = 'capture'
		//- 		ref = 'viewer'
		//- 		:key = 'current_camera_name'
		//- 		:current_camera_node_graph_id = 'current_camera_node_graph_id'
		//- 		@capture_render_completed = 'on_capture_render_completed'
		//- 	)





</template>

<script lang="ts">
// import CameraMenu from './Mixin/CameraMenu';
// import Display from './Mixin/Display';
// import EventDisplay from './Mixin/EventDisplay';
// import {JsonMixin} from './Mixin/Json';
// import NodeOwner from 'src/Editor/Component/Mixin/NodeOwner';
// import Panel from './Mixin/Panel';
// import {ViewerCapture} from './Mixin/ViewerCapture';

// const AsyncThreejsViewer = () => ({
// 	component: import('./Component/Threejs'),
// });

import {createComponent} from '@vue/composition-api';
export default createComponent({
	name: 'network-panel',
	// mixins: [
	// 	CameraMenu,
	// 	Display,
	// 	EventDisplay,
	// 	JsonMixin,
	// 	NodeOwner,
	// 	Panel,
	// 	ViewerCapture,
	// ],
	// components: {
	// 	ThreejsViewer: AsyncThreejsViewer,
	// },

	// props: {
	// 	panel_id: {
	// 		type: Array,
	// 		default: () => {
	// 			return [];
	// 		},
	// 	},
	// 	scene_update_allowed: {
	// 		type: Boolean,
	// 		default: false,
	// 	},
	// },

	// mounted() {
	// 	POLY.register_viewer(this);
	// },
	// destroyed() {
	// 	POLY.deregister_viewer(this);
	// },

	// computed: {
	// 	player_mode() {
	// 		return POLY.player_mode();
	// 	},
	// },
});
</script>

<style lang="sass">
@import "globals.sass"

.Panel.Viewer

	canvas, #mapbox_container
		width: 100%
		height: 100%

	.viewer_top_bar
		// background-color: lightblue

		.viewer_top_bar-controls-right
			padding-right: 10px
		// .viewer-control
		// 	cursor: pointer
		// 	margin-right: 10px
		// 	padding: 5px 10px // same as dropdown menu
		// 	&:hover
		// 		opacity: 0.8
		input
			margin-bottom: 0px
			padding: 0px
		input[type=color]
			width: 20px
			height: 20px
		.color-bg-input-container
			margin-top: 4px

	.viewers_container
		position: relative
		.panel_container
			position: absolute
			min-width: 360px
			// width: 100%
			top: 0px
			left: 0px
			padding: 10px 10px

			// label
			// 	color: white

			opacity: 0.85
			&:hover
				opacity: 1

		// .event_screen_positions
		// 	position: absolute
		// 	pointer-events: none
		// 	top: 0
		// 	left: 0
		// 	width: 100%
		// 	height: 100%
		// 	.event_screen_position
		// 		position: absolute
		// 		width: 5px
		// 		height: 5px
		// 		// background-color: red
		// 		border: 1px solid black
		// 		border-radius: 5px

		// 		.event-screen-position-label
		// 			position: absolute
		// 			left: 10px
		// 			line-height: 1
		// 			width: auto
		// 			background-color: white
		// 			color: black
</style>
