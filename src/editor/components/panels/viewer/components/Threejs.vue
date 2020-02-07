
<template lang='pug'>

	include /mixins.pug

	doctype html


	.ThreejsViewer
		//- resize-observer(
		//- 	v-if = '!player_mode'
		//- 	@notify="on_resize"
		//- 	)
		div(
			ref='viewer'
			)




</template>

<script lang='ts'>
// import {CameraCommon} from '../Mixin/CameraCommon';
// import {Camera} from './Mixin/Camera';
// import NodeOwner from 'src/Editor/Component/Mixin/NodeOwner';
// import {Picker} from '../Mixin/Picker';
// import {Player} from '../Mixin/Player';
// import {ViewerComponentCapture} from './Mixin/ViewerComponentCapture';
// import {WindowResize} from './Mixin/WindowResize';
import {StoreController} from 'src/editor/store/controllers/StoreController';
import {BaseCameraObjNodeType} from 'src/engine/nodes/obj/_BaseCamera';
import {ThreejsViewer} from 'src/engine/viewers/Threejs';

import {createComponent, onMounted, onBeforeUnmount, computed, ref} from '@vue/composition-api';
export default createComponent({
	name: 'viewer-threejs',
	// mixins: [
	// 	Camera,
	// 	CameraCommon,
	// 	NodeOwner,
	// 	Picker,
	// 	Player,
	// 	ViewerComponentCapture,
	// 	WindowResize
	// ],
	props: {
		current_camera_node_graph_id: {
			type: String,
		},
	},

	setup(props) {
		// const do_render = ref(true)
		const viewer = ref<HTMLElement>(null);

		const current_camera_node = computed(() => {
			if (props.current_camera_node_graph_id) {
				return StoreController.scene.graph.node_from_id(
					props.current_camera_node_graph_id
				) as BaseCameraObjNodeType;
			}
		});

		let camera_viewer: ThreejsViewer | undefined;
		onMounted(() => {
			if (viewer.value) {
				camera_viewer = current_camera_node.value?.create_viewer(viewer.value);
			}
		});
		onBeforeUnmount(() => {
			camera_viewer?.dispose();
		});

		// const display_scene = computed(()=>{

		// })

		// functions
		// function on_resize(){
		// 	camera_viewer?.on_resize();
		// }
		// function canvas_for_capture() {
		// 	return camera_viewer?.canvas();
		// }

		return {
			viewer,
		};
	},

	// computed: {
	// 	display_scene() {
	// 		return this._display_scene != null ? this._display_scene : (this._display_scene = this.$store.scene.display_scene());
	// 	}
	// },
});
</script>

<style lang='sass'>

	.ThreejsViewer
		height: 100%


</style>
