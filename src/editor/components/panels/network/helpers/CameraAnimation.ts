import {Vector2} from 'three/src/math/Vector2';
import {Box2} from 'three/src/math/Box2';
import {CoreMath} from 'src/core/math/_Module';
import {EventHelper} from 'src/core/EventHelper';
import {BaseNodeType} from 'src/engine/nodes/_Base';

const ZOOM_PROJ_VECTOR = new Vector2(1, 1);

export interface CameraData {
	position: {x: number; y: number};
	zoom: number;
}

export class CameraAnimationHelper {
	// public camera_position: Vector2 = new Vector2(50,50)
	// private properties_by_current_node: object = {}
	// private _parent_node: BaseNode

	private event_helper: EventHelper = new EventHelper(document.body);

	private pan_start_mouse_position: Vector2 = new Vector2();
	private pan_start_camera_position: Vector2 = new Vector2();
	private mouse_position: Vector2 = new Vector2();
	private pan_progress_position: Vector2 = new Vector2();
	private _pan_in_progress: boolean = false;

	private zoom_start_mouse_position: Vector2 = new Vector2();
	private zoom_current_mouse_position: Vector2 = new Vector2();
	private _zoom_offset: Vector2 = new Vector2();
	private _zoom_in_progress: boolean = false;

	private min_zoom: number = 0.1;
	private max_zoom: number = 2;
	// private _zoom_offset: number

	private parent_node: BaseNodeType | undefined;

	constructor(private data: CameraData) {}

	set_element(element: HTMLElement) {
		this.event_helper.set_element(element);
	}
	set_parent_node(node: BaseNodeType) {
		this.parent_node = node;
	}
	position(): Vector2 {
		return new Vector2(this.data.position.x, this.data.position.y);
	}
	// camera_position(){
	// 	return this._camera_position
	// }

	// set_parent_node(parent_node: BaseNode){
	// 	//if (previous_parent_node = @_parent_node)?
	// 		//@data_by_parent_node_id[previous_parent_node.graph_node_id()] =
	// 		//	position: @camera.position.clone()
	// 		//	zoom: @camera.zoom

	// 	// const previous_parent_node = this._parent_node;
	// 	this._parent_node = parent_node;
	// 	// if ((this._parent_node != null) && (this._parent_node !== previous_parent_node)) {
	// 		// this._update_camera_from_json();
	// 	// }
	// }
	//if (data = @data_by_parent_node_id[@_parent_node.graph_node_id()])?
	//	@camera.position.copy(data['position'])
	//	@camera.zoom = data['zoom']
	//	@camera.updateProjectionMatrix()

	move_in_progress(): boolean {
		return this.is_pan_in_progress() || this.is_zoom_in_progress();
	}

	//
	//
	// NAVIGATION
	//
	//

	reset() {
		// this.camera.position.x = 0;
		// this.camera.position.y = 0;
	}

	//
	// PAN
	//
	pan_start(event: MouseEvent) {
		this.event_helper.element_position(event, this.pan_start_mouse_position);
		this.pan_start_camera_position.x = this.data.position.x;
		this.pan_start_camera_position.y = this.data.position.y;
		this._pan_in_progress = true;
		// this.pan_camera = this.camera.clone();
		// this.pan_start_position = this.ray_helper.intersect_plane_from_event(event, this.pan_camera);
		// this.pan_start_camera_position = this.camera.position.clone();
	}

	pan_progress(event: MouseEvent) {
		if (!this.is_pan_in_progress()) {
			return false;
		}

		this.event_helper.element_position(event, this.mouse_position);
		const pan_mouse_offset = this.mouse_position /*.clone()*/
			.sub(this.pan_start_mouse_position)
			.divideScalar(this.data.zoom);

		this.pan_progress_position.copy(this.pan_start_camera_position).add(pan_mouse_offset);
		this.data.position.x = this.pan_progress_position.x;
		this.data.position.y = this.pan_progress_position.y;
		// const pan_prev_position = (this.pan_current_position || this.pan_start_position).clone();
		// this.pan_current_position = this.ray_helper.intersect_plane_from_event(event, this.pan_camera);

		// const pan_offset = this.pan_start_position.clone().sub(this.pan_current_position);
		// const new_pos = this.pan_start_camera_position.clone().add(pan_offset);

		// this.camera.position.x = new_pos.x;
		// this.camera.position.y = new_pos.y;
		// this.camera.updateProjectionMatrix();
		return true;
	}

	pan_end(/*event: MouseEvent*/) {
		// const pan_was_in_progress = this.is_pan_in_progress();
		this._pan_in_progress = false;
		// this.pan_camera = null;
		// this.pan_current_position = null;

		// this._update_json();

		// return pan_was_in_progress;
	}

	is_pan_in_progress(): boolean {
		return this._pan_in_progress;
	}

	//
	// ZOOM
	//
	zoom_start(event: MouseEvent) {
		this.event_helper.element_position(event, this.zoom_start_mouse_position);
		this._zoom_in_progress = true;
		// this.zoom_camera = this.camera.clone();
		// this.zoom_start_position = this.ray_helper.intersect_plane_from_event(event, this.zoom_camera);
		// this.zoom_start_camera_position = this.camera.position.clone();
		// return this.zoom_start_camera_zoom = this.camera.zoom;
	}

	zoom_progress(event: MouseEvent) {
		if (!this.is_zoom_in_progress()) {
			return;
		}

		this.event_helper.element_position(event, this.zoom_current_mouse_position);

		// // const zoom_prev_position = (this.zoom_current_position || this.zoom_start_position).clone();
		// this.zoom_current_position = this.ray_helper.intersect_plane_from_event(event, this.zoom_camera);

		this._zoom_offset.copy(this.zoom_start_mouse_position);
		this._zoom_offset.sub(this.zoom_current_mouse_position);

		const dot = this._zoom_offset.dot(ZOOM_PROJ_VECTOR);
		const new_zoom = this.data.zoom - 0.001 * dot;

		this.set_zoom(new_zoom);
		this.zoom_start_mouse_position.copy(this.zoom_current_mouse_position);
		// return true;
	}

	zoom_end(/*event: MouseEvent*/) {
		// const zoom_was_in_progress = this.is_zoom_in_progress();
		// this.zoom_start_position = null;
		// this.zoom_camera = null;
		// this.zoom_current_position = null;
		// this._zoom_offset = null;
		// this.zoom_start_mouse_position = null
		this._zoom_in_progress = false;
		// return zoom_was_in_progress;
	}

	is_zoom_in_progress(): boolean {
		//@zoom_camera?
		return this._zoom_in_progress;
		// return (this._zoom_offset != null) && (this._zoom_offset.length() > 0.01);
	}

	zoom(wheel_event: WheelEvent) {
		const direction_in = wheel_event.deltaY < 0;
		const current_zoom = this.data.zoom;

		let mult = 0.9;
		if (direction_in) {
			mult = 1 / mult;
		}

		const new_zoom = current_zoom * mult;
		this.set_zoom(new_zoom);
	}
	set_zoom(new_zoom: number) {
		new_zoom = CoreMath.clamp(new_zoom, this.min_zoom, this.max_zoom);

		this.data.zoom = new_zoom;

		// this._update_json();
	}

	frame_selection() {
		if (!this.parent_node) {
			return;
		}
		if (!this.parent_node.children_allowed() || !this.parent_node.children_controller) {
			return;
		}
		const selected_nodes = this.parent_node.children_controller.selection.nodes();
		const nodes = selected_nodes.length > 0 ? selected_nodes : this.parent_node.children();

		const box = new Box2();
		nodes.forEach((node) => {
			box.expandByPoint(node.ui_data.position());
		});
		const center = new Vector2();
		box.getCenter(center);

		this.data.position.x = -center.x;
		this.data.position.y = -center.y;
	}
}
