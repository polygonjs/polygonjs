<template lang="pug">

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
							//- :style = 'object_parents_style_object'
							.nodes-container(
								ref = 'nodes_container'
								@mousedown = 'on_mouse_down'
								@mousemove = 'on_mouse_move'
								@mouseup = 'on_mouse_up'
								)
								.nodes-container-events-catcher
								.selection-rectangle(:style = 'selection_rectangle_style_object')
								.node-creation-rectangle(:style = 'node_creation_rectangle_style_object')
								//- @capture_node_for_selection = 'on_capture_node_for_selection'
								Node(
									v-for = 'json_child in json_children'
									:key = 'json_child.graph_node_id'
									:json_node = 'json_child'
									:json_parent = 'json_node'
									:action_in_progress = 'action_in_progress'

									@capture_node_for_move = 'on_capture_node_for_move'
									@capture_node_src_for_connection = 'on_capture_node_src_for_connection'
									@capture_node_dest_for_connection = 'on_capture_node_dest_for_connection'
									@capture_node_final_for_connection = 'on_capture_node_final_for_connection'
									@set_display_flag = 'on_set_display_flag'
									@set_bypass_flag = 'on_set_bypass_flag'
								)
								InterractiveConnection(
									v-if = 'connection_data.active'
									:mouse_start = 'connection_data.mouse_start'
									:mouse_progress = 'connection_data.mouse_progress'
								)

		TabMenu(
			v-if = 'tab_menu_opened'
			:style = 'tab_menu_style_object'
			:json_node = 'json_node'
			@close = 'close_tab_menu'
			@select = 'on_tab_menu_select'
			)


</template>

<script lang="ts">
// mixins
import {SetupCamera} from './mixins/Camera';
// import {Clipboard} from './Mixins/Clipboard';
import {SetupEventKey} from './mixins/EventKey';
import {SetupEventMouse} from './mixins/EventMouse';
import {SetupJson} from './mixins/Json';
import {SetupNodeAnimation} from './mixins/NodeAnimation';
import {SetupNodeConnection} from './mixins/NodeConnection';
import {SetupNodeCreation} from './mixins/NodeCreation';
import {SetupNodeEvent} from './mixins/NodeEvent';
import {SetupNodeNavigation} from './mixins/NodeNavigation';
// import NodeOwner from '../../Mixin/NodeOwner';
import {SetupNodeSelection} from './mixins/NodeSelection';
import {SetupTabMenu} from './mixins/TabMenuOwner';

// components
import TabMenu from './components/TabMenu.vue';

import Node from './components/Node.vue';
import InterractiveConnection from './components/InterractiveConnection.vue';

import {NodeCreationHelper, NodeCreationData} from './helpers/NodeCreation';
import {CameraData, CameraAnimationHelper} from './helpers/CameraAnimation';
import {ClipBoardHelper} from './helpers/ClipBoard';
import {NodeAnimationHelper} from './helpers/NodeAnimation';
import {ConnectionHelper, ConnectionData} from './helpers/Connection';
import {NodeSelectionHelper, NodeSelectionData} from './helpers/NodeSelection';
import {StoreController} from '../../../store/controllers/StoreController';

import {defineComponent, Ref, ref, computed} from '@vue/composition-api';
export default defineComponent({
	name: 'network-panel',
	components: {TabMenu, Node, InterractiveConnection},

	setup(props) {
		const canvas = ref<HTMLCanvasElement>(null);
		const nodes_container = ref<HTMLElement>(null);

		const json_node = computed(() => {
			return StoreController.editor.current_json_node();
		});
		const json_children = computed(() => {
			const id = StoreController.editor.current_node_graph_id();
			if (id) {
				return StoreController.engine.json_children(id);
			} else {
				return [];
			}
		});

		const node_creation_data = ref<NodeCreationData>({active: false, position: {x: 0, y: 0}});
		const camera_data = ref<CameraData>({
			position: {x: 0, y: 0},
			zoom: 0.5,
		});
		const camera_history: Dictionary<CameraData> = {};
		const connection_data = ref<ConnectionData>({
			node_src_id: null,
			node_dest_id: null,
			output_index: 0,
			input_index: 0,
			mouse_start: {x: 0, y: 0},
			mouse_progress: {x: 0, y: 0},
			active: false,
		});
		const node_selection_data = ref<NodeSelectionData>({
			start: {x: 0, y: 0},
			end: {x: 0, y: 0},
			active: false,
		});

		const cam_animation_helper: CameraAnimationHelper = new CameraAnimationHelper(camera_data.value);
		const clipboard_helper = new ClipBoardHelper();
		const node_creation_helper = new NodeCreationHelper(node_creation_data.value, camera_data.value);
		const node_animation_helper = new NodeAnimationHelper(camera_data.value);
		const connection_helper = new ConnectionHelper(connection_data.value, camera_data.value);
		const node_selection_helper = new NodeSelectionHelper(node_selection_data.value, camera_data.value);
		const helpers = {
			node_animation_helper,
			connection_helper,
			node_selection_helper,
			cam_animation_helper,
			node_creation_helper,
		};

		const camera_options = SetupCamera(canvas, camera_data, camera_history, cam_animation_helper);
		const tab_menu_options = SetupTabMenu(canvas, node_creation_helper);
		const event_key_options = SetupEventKey(clipboard_helper, cam_animation_helper, tab_menu_options);
		const options = {
			camera_options,
			tab_menu_options,
			event_key_options,
		};
		const event_mouse_options = SetupEventMouse(helpers, options);

		const action_in_progress: Readonly<Ref<boolean>> = computed(() => {
			return node_selection_data.value.active || connection_data.value.active;
		});
		// TODO typescript: ensure all EventHelper are set, or have only 1

		return {
			canvas,
			nodes_container,
			connection_data,
			json_node,
			json_children,
			action_in_progress,
			...camera_options,
			...event_key_options,
			...event_mouse_options,
			...SetupJson(camera_data.value, camera_history),
			...SetupNodeAnimation(node_animation_helper, nodes_container),
			...SetupNodeConnection(connection_data.value, connection_helper, nodes_container),
			...SetupNodeCreation(nodes_container, node_creation_helper),
			...SetupNodeEvent(helpers),
			...SetupNodeNavigation(),
			...SetupNodeSelection(node_selection_data.value, node_selection_helper, nodes_container),
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

<style lang="sass">
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
				line-height: 0
				&:hover
					opacity: 1
				svg
					display: inline-block
					margin: auto
					position: relative
					// top: 50%
					// transform: translateY(-50%)

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
