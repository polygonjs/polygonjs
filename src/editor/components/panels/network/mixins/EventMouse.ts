// import EventHelper from '../../Helper/Event';
import {MouseButton} from 'src/editor/core/MouseButton';

import {ref, computed} from '@vue/composition-api';
import {NodeAnimationHelper} from '../helpers/NodeAnimation';
import {ConnectionHelper} from '../helpers/Connection';
import {NodeSelectionHelper} from '../helpers/NodeSelection';
import {TypeAssert} from 'src/engine/poly/Assert';
import {CameraAnimationHelper} from '../helpers/CameraAnimation';
import {NodeCreationHelper} from '../helpers/NodeCreation';
import {KeyEventsDispatcher} from 'src/editor/helpers/KeyEventsDispatcher';
export function SetupEventMouse(
	node_animation_helper: NodeAnimationHelper,
	connection_helper: ConnectionHelper,
	node_selection_helper: NodeSelectionHelper,
	cam_animation_helper: CameraAnimationHelper,
	node_creation_helper: NodeCreationHelper
) {
	const pan_in_progress = ref(false);
	const zoom_in_progress = ref(false);

	const canvas_class_object = computed(() => {
		return {
			pan_in_progress: pan_in_progress.value,
			zoom_in_progress: zoom_in_progress.value,
		};
	});

	function on_mouse_down(event: MouseEvent) {
		// this._registered_mouse_down = true;

		switch (event.button) {
			case MouseButton.LEFT:
				// var intersect = this.ray_helper.intersected_mesh_with_callback(event, 'mouse_down', this.camera);
				// if (intersect != null) {
				// 	intersect.callbacks['mouse_down']();
				// } else {
				// 	if (this.node_selection_helper != null) {
				// 		this.node_selection_helper.move_start(event);
				// 	}
				// }
				const node_animation_started = node_animation_helper.move_start(event);
				if (node_animation_started) {
					return;
				}
				const connection_started = connection_helper.move_start(event);
				if (connection_started) {
					return;
				}

				node_selection_helper.move_start(event);
				//this.connection_helper.move_start(event);
				break;

			case MouseButton.MIDDLE:
				cam_animation_helper.pan_start(event);
				pan_in_progress.value = true;
				break;

			case MouseButton.RIGHT:
				cam_animation_helper.zoom_start(event);
				zoom_in_progress.value = true;
				break;
		}
	}

	function on_mouse_move(event: MouseEvent) {
		KeyEventsDispatcher.instance().register_processor(this);

		update_tab_menu_position(event);

		// this._current_mouse_pos = {x: event.pageX, y: event.pageY};
		// this._current_mouse_pos_on_plane = this.ray_helper.intersect_plane_from_event(event, this.camera);

		cam_animation_helper.pan_progress(event);
		cam_animation_helper.zoom_progress(event);

		node_animation_helper.move_progress(event);
		node_creation_helper.move_progress(event);
		connection_helper.move_progress(event);
		node_selection_helper.move_progress(event);
	}
	function on_mouse_up(event: MouseEvent) {
		const move_in_progress = node_animation_helper.move_in_progress() || cam_animation_helper.move_in_progress();

		// console.log("move_in_progress", move_in_progress, this.node_selection_helper.mouse_barely_moved(event))
		//if (this.node_selection_helper != null) {
		// if(!move_in_progress){
		const node_move_barely_moved = node_animation_helper.mouse_barely_moved();
		node_selection_helper.move_end(event, move_in_progress, node_move_barely_moved);
		// }
		// if( move_in_progress && this.node_selection_helper.mouse_barely_moved(event) ){
		// 	this.node_selection_helper.move_end(event, move_in_progress)
		// }
		//}

		cam_animation_helper.pan_end();
		cam_animation_helper.zoom_end();
		zoom_in_progress.value = false;
		pan_in_progress.value = false;

		node_animation_helper.move_end();
		connection_helper.move_end();

		// tab menu
		if (!move_in_progress) {
			if (this._registered_mouse_down) {
				// in case we come here from a slider slide in another panel
				toggle_tab_menu();
			} else {
				close_tab_menu();
			}
		} else {
			close_tab_menu();
		}

		// this._registered_mouse_down = false;
		save_camera_history_for_json_node(this.json_node);
	}

	function on_double_click(event: MouseEvent) {
		// const intersect = this.ray_helper.intersected_mesh_with_callback(event, 'dbl_click', this.camera);
		// if (intersect != null) {
		// 	return intersect.callbacks['dbl_click']();
		// }
	}
	function on_click(event: MouseEvent) {
		close_tab_menu();
		node_creation_helper.create(event);
	}
	function on_context_menu(event: MouseEvent) {
		//this.toggle_tab_menu()
		//event.stopPropagation()
		return false;
	}
	function on_wheel(event: WheelEvent) {
		cam_animation_helper.zoom(event);
		save_camera_history_for_json_node(this.json_node);
	}

	return {
		canvas_class_object,
		on_mouse_down,
		on_mouse_move,
		on_mouse_up,
		on_click,
		on_context_menu,
		on_wheel,
	};
}
