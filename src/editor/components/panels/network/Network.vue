
<template lang='pug'>

	include /mixins.pug
	doctype html

	.Panel.Network.full_height_container.grid-y
		.cell.shrink
			.grid-x.buttons-container-height-0
				.cell.shrink
					.button.tiny.above-event-catcher.disable-select(
						@click = 'toggle_tab_menu'
						@contextmenu.capture.prevent = 'toggle_tab_menu'
					) + Add Node
				.cell.auto
				.cell.shrink
					.go-up-button-container.above-event-catcher(
						v-if = 'display_go_up_button'
						)
						.go-up-button(@click = 'go_up')
							v-icon(name='angle-double-up')
		.cell.auto
			.canvas_container(
				ref = 'canvas_container'
				)
				//- @dblclick = 'on_double_click'
				//- @mouseenter = 'on_mouse_enter'
				//- @wheel has 'prevent' to ensure that zooming in and out in the doc examples does not scroll the page
				.canvas(
					ref = 'canvas'
					@click = 'on_click'
					@wheel.prevent = 'on_wheel'
					:class = 'canvas_class_object'
					)
					//- @contextmenu.capture.prevent = 'on_context_menu'

					.zoom-container(
						:style = 'zoom_container_style_object'
						)
						.pan-container(
							:style = 'pan_container_style_object'
							)
							.nodes-container(
								ref = 'nodes_container'
								:style = 'object_parents_style_object'
								@mousedown = 'on_mouse_down'
								@mousemove = 'on_mouse_move'
								@mouseup = 'on_mouse_up'
								)
								.nodes-container-events-catcher
								.selection-rectangle(:style = 'selection_rectangle_style_object')
								.node-creation-rectangle(:style = 'node_creation_rectangle_style_object')
								Node(
									v-for = 'json_child in json_children'
									:key = 'json_child.graph_node_id'
									:json_node = 'json_child'
									:json_parent = 'json_node'
									:action_in_progress = 'action_in_progress'

									@capture_node_for_move = 'on_capture_node_for_move'
									@capture_node_for_selection = 'on_capture_node_for_selection'
									@capture_node_src_for_connection = 'on_capture_node_src_for_connection'
									@capture_node_dest_for_connection = 'on_capture_node_dest_for_connection'
									@capture_node_final_for_connection = 'on_capture_node_final_for_connection'
									@set_display_flag = 'on_set_display_flag'
									@set_bypass_flag = 'on_set_bypass_flag'
								)
								InterractiveConnection(
									v-if = 'connection.active'
									:mouse_start = 'connection.mouse_start'
									:mouse_progress = 'connection.mouse_progress'
								)

		TabMenu(
			v-if = 'tab_menu_opened'
			:style = 'tab_menu_style_object'
			:json_node = 'json_node'
			@close = 'close_tab_menu'
			@select = 'on_tab_menu_select'
			)


</template>

<script lang='ts'>
// mixins
import {SetupCamera} from './mixins/Camera';
// import {Clipboard} from './Mixins/Clipboard';
import {SetupEventKey} from './mixins/EventKey';
import {SetupEventMouse} from './mixins/EventMouse';
// import {Json} from './Mixins/Json';
// import {NodeAnimation} from './Mixins/NodeAnimation';
// import {NodeConnection} from './Mixins/NodeConnection';
import {SetupNodeCreation} from './mixins/NodeCreation';
// import {NodeEvent} from './Mixins/NodeEvent';
import {SetupNodeNavigation} from './mixins/NodeNavigation';
// import NodeOwner from '../../Mixin/NodeOwner';
// import {NodeSelection} from './Mixins/NodeSelection';
import {SetupTabMenu} from './mixins/TabMenuOwner';

// components
import TabMenu from './components/TabMenu.vue';

// import Node from './components/Node';
// import InterractiveConnection from './components/InterractiveConnection';

import {NodeCreationHelper, NodeCreationData} from './helpers/NodeCreation';
import {CameraData, CameraAnimationHelper} from './helpers/CameraAnimation';
import {ClipBoardHelper} from './helpers/ClipBoard';

import {createComponent, ref} from '@vue/composition-api';
export default createComponent({
	name: 'network-panel',
	components: {TabMenu},

	setup(props) {
		const canvas = ref<HTMLCanvasElement>(null);
		const nodes_container = ref<HTMLElement>(null);
		const node_creation_data = ref<NodeCreationData>({active: false, position: {x: 0, y: 0}});
		const camera_data = ref<CameraData>({
			position: {x: 0, y: 0},
			zoom: 0.5,
		});

		const cam_animation_helper: CameraAnimationHelper = new CameraAnimationHelper(camera_data.value);
		const clipboard_helper = new ClipBoardHelper();
		const node_creation_helper = new NodeCreationHelper(node_creation_data.value, camera_data.value);

		const tab_menu_options = SetupTabMenu(canvas, node_creation_helper);

		// TODO typescript: ensure all EventHelper are set, or have only 1

		return {
			canvas,
			nodes_container,
			...SetupCamera(canvas, camera_data, cam_animation_helper),
			...SetupEventKey(clipboard_helper, cam_animation_helper, tab_menu_options),
			...SetupEventMouse()
			...SetupNodeCreation(nodes_container, node_creation_helper),
			...SetupNodeNavigation(),
			...tab_menu_options,
		};
	},
	// mixins: [
	// 	Camera,
	// 	Clipboard,
	// 	EventKey,
	// 	EventMouse,
	// 	Json,
	// 	NodeAnimation,
	// 	NodeConnection,
	// 	NodeCreation,
	// 	NodeEvent,
	// 	NodeNavigation,
	// 	NodeOwner,
	// 	NodeSelection,
	// 	TabMenuOwner,
	// ],
	// components: {InterractiveConnection, Node},

	// computed: {
	// 	action_in_progress(): boolean {
	// 		return this.selection.active || this.connection.active;
	// 	},
	// },
});
</script>

<style lang='sass'>
	@import "globals.sass"

	$z_index_above_events_catcher: 10
	// $panel_background_color: mix($color_bg, orange, 50%)
	.above-event-catcher
		position: relative
		z-index: $z_index_above_events_catcher

	.Panel.Network
		// background-color: darken($color_font, 20%)
		// color: $color_bg

		position: relative // for tab menu

		.buttons-container-height-0
			height: 0px
			padding-left: 5px
			padding-top: 5px
			.go-up-button-container
				margin-right: 5px
				.go-up-button
					padding: 5px
					border-radius: 25px
					width: 25px
					height: 25px
					text-align: center
					background-color: lightgreen
					cursor: pointer
					opacity: 0.7
					&:hover
						opacity: 1
					svg
						display: inline-block
						margin: auto
						position: relative
						top: 50%
						transform: translateY(-50%)

		.canvas_container, .canvas, .object_parents
			width: 100%
			height: 100%


		.canvas_container
			.canvas
				// background-color: darken(white, 40%)
				overflow: hidden
				position: relative
				&.pan_in_progress
					cursor: move
				&.zoom_in_progress
					cursor: zoom-in

				.selection-rectangle
					pointer-events: none
					position: absolute
					border: 3px solid green
					z-index: 10
					background-color: grey
					opacity: 0.2

				.node-creation-rectangle
					pointer-events: none
					position: absolute
					border: 3px solid green
					z-index: 10

				.zoom-container
					position: absolute
					top: 50%
					left: 50%
					width: 20px
					height: 20px
					// background-color: red
					.pan-container
						position: absolute
						width: 10px
						height: 10px
						// background-color: green

						$node_container_size: 50000px
						.nodes-container
							position: relative
							width: 0
							height: 0
							top: 0
							left: 0
							// background-color: lighten(blue,20%)
							// background-color: pink
							// overflow: hidden
							.nodes-container-events-catcher
								position: absolute
								width: $node_container_size
								height: $node_container_size
								top: -$node_container_size/2
								left: -$node_container_size/2
								// background-color: lighten(red,20%)

							svg.connection-line-container
								position: absolute
								top: 0px
								left: 0px
								width: 100%
								height: 100%
								z-index: 10
								// background-color: pink
								// opacity: 1
								pointer-events: none
								line
									stroke: grey
									stroke-width: 2


</style>
