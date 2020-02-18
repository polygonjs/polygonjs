<template lang="pug">

	include /mixins.pug

	doctype html


	.Panel.Viewer.full_height_container.grid-y
		.cell.shrink.viewer_top_bar
			.grid-x
				.cell.shrink
					DropDownMenu(
						:label = 'camera_menu_label'
						:entries = 'camera_menu_entries'
						:sort_entries = 'true'
						@select = 'on_select_camera_menu_entry_select'
					)
				.cell.auto
				.cell.shrink.text-right
					.full-screen-button(@click = 'toggle_fullscreen')
						v-icon(name = 'regular/square')
				//- .cell.shrink.text-right(v-if = 'scene_update_allowed')
				//- 	DropDownMenu(
				//- 		v-if = '!capture.active'
				//- 		label = 'capture'
				//- 		:entries = 'capture_menu_entries'
				//- 		@select = 'on_capture_menu_entry_select'
				//- 		:right_aligned = 'true'
				//- 	)

		.cell.auto.viewers_container(
			ref = 'viewer_container'
			)
			//- :capture = 'capture'
			//- @capture_render_completed = 'on_capture_render_completed'
			ThreejsViewer(
				ref = 'viewer'
				:key = 'current_camera_node_graph_id'
				:current_camera_node_graph_id = 'current_camera_node_graph_id'
			)





</template>

<script lang="ts">
// import CameraMenu from './Mixin/CameraMenu';
// import Display from './Mixin/Display';
// import EventDisplay from './Mixin/EventDisplay';
// import {JsonMixin} from './Mixin/Json';
// import NodeOwner from 'src/Editor/Component/Mixin/NodeOwner';
// import Panel from './Mixin/Panel';
// import {ViewerCapture} from './Mixin/ViewerCapture';

import ThreejsViewer from './components/Threejs.vue';
// const AsyncThreejsViewer = () => ({
// 	component: import('./components/Threejs.vue'),
// });

import {StoreController} from 'src/editor/store/controllers/StoreController';
import {BaseCameraObjNodeType} from 'src/engine/nodes/obj/_BaseCamera';

import {createComponent, ref, computed} from '@vue/composition-api';
import {EngineNodeData} from '../../../store/modules/Engine';
import {DropDownMenuEntry} from '../../types/props';
export default createComponent({
	name: 'viewer-panel',
	components: {
		ThreejsViewer,
	},
	props: {
		panel_id: {
			type: String,
			default: null,
		},
	},

	setup(props) {
		const current_camera_node_graph_id = ref<string | null>(
			StoreController.scene.cameras_controller.master_camera_node?.graph_node_id
		);
		const current_camera_node = computed(() => {
			if (current_camera_node_graph_id.value) {
				return StoreController.scene.graph.node_from_id(
					current_camera_node_graph_id.value
				) as BaseCameraObjNodeType;
			}
		});

		const camera_menu_label = computed(() => {
			return current_camera_node.value?.name || 'no camera';
		});
		const camera_menu_entries = computed(() => {
			const root_json_children: EngineNodeData[] = StoreController.scene.root
				.children()
				.map((c) => StoreController.engine.json_node(c.graph_node_id)!)
				.filter((data) => data != null);
			const camera_types = ['perspective_camera', 'orthographic_camera'];
			const camera_json_nodes = root_json_children.filter((data) => data && camera_types.includes(data.type));
			const entries: DropDownMenuEntry[] = camera_json_nodes.map((data) => {
				const entry: DropDownMenuEntry = {
					id: data.graph_node_id,
					label: data.name,
				};
				return entry;
			});
			return entries;
		});

		function on_select_camera_menu_entry_select(entry_id: string) {
			current_camera_node_graph_id.value = entry_id;
		}
		function on_capture_render_completed() {}

		function toggle_fullscreen() {
			if (StoreController.editor.panel.fullscreen_panel_id()) {
				StoreController.editor.panel.set_fullscreen_panel_id(null);
			} else {
				StoreController.editor.panel.set_fullscreen_panel_id(props.panel_id);
			}
		}

		return {
			camera_menu_label,
			camera_menu_entries,
			on_select_camera_menu_entry_select,
			current_camera_node_graph_id,
			on_capture_render_completed,
			toggle_fullscreen,
		};
	},

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
		background-color: lighten($color_bg_panel_viewer,5%)

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

	.full-screen-button
		margin-right: 10px
		height: 100%
		position: relative
		cursor: pointer
		line-height: 0
		svg
			position: relative
			top: 50%
			transform: translateY(-50%)
		&:hover
			opacity: 0.7
</style>
