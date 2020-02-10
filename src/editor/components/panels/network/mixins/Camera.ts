import {CameraAnimationHelper, CameraData} from '../helpers/CameraAnimation';
import {StoreController} from 'src/editor/store/controllers/StoreController';

export interface SetupCameraOptions {
	zoom_container_style_object: Ref<{
		transform: string;
	}>;
	pan_container_style_object: Ref<{left: string; top: string}>;
	// object_parents_style_object,
	save_camera_history_for_json_node: (id: string) => void;
}

import {watch, onMounted, Ref, computed} from '@vue/composition-api';
export function SetupCamera(
	canvas: Ref<HTMLCanvasElement | null>,
	camera_data: Ref<CameraData>,
	camera_history: Dictionary<CameraData>,
	cam_animation_helper: CameraAnimationHelper
): SetupCameraOptions {
	onMounted(() => {
		if (canvas.value) {
			cam_animation_helper.set_element(canvas.value);
			set_camera_helper_node();
		}
	});

	const zoom_container_style_object = computed(() => {
		return {
			transform: `scale(${camera_data.value.zoom})`,
		};
	});
	const pan_container_style_object = computed(() => {
		return {
			left: `${camera_data.value.position.x}px`,
			top: `${camera_data.value.position.y}px`,
		};
	});
	// const object_parents_style_object = computed(() => {
	// 	return {};
	// });

	const current_node_graph_id = computed(() => StoreController.editor.current_node_graph_id());
	watch(current_node_graph_id, (node_graph_id, prev_node_graph_id) => {
		if (prev_node_graph_id) {
			save_camera_history_for_json_node(prev_node_graph_id);
		}
		if (node_graph_id) {
			load_camera_history_for_json_node(node_graph_id);
		}
		// this.$nextTick(() => {
		set_camera_helper_node();
		// });
	});

	// functions
	function set_camera_helper_node() {
		cam_animation_helper.set_parent_node(StoreController.editor.current_node());
	}

	// function set_camera_history(history: Dictionary<CameraData>) {
	// 	camera_history = json || {};
	// }
	// function camera_history() {
	// 	this._camera_history = this._camera_history || {}
	// }
	// function camera_history_for_node(graph_node_id: string) {
	// 	return camera_history[graph_node_id];
	// }
	function save_camera_history_for_json_node(graph_node_id: string) {
		camera_history[graph_node_id] = {
			position: {
				x: camera_data.value.position.x,
				y: camera_data.value.position.y,
			},
			zoom: camera_data.value.zoom,
		};
	}
	function load_camera_history_for_json_node(graph_node_id: string) {
		const node_history = camera_history[graph_node_id];
		if (node_history) {
			camera_data.value.zoom = node_history.zoom;
			camera_data.value.position.x = node_history.position.x;
			camera_data.value.position.y = node_history.position.y;
		}
	}

	return {
		zoom_container_style_object,
		pan_container_style_object,
		// object_parents_style_object,
		save_camera_history_for_json_node,
	};
}
