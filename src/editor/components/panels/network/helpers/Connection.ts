import {Vector2} from 'three/src/math/Vector2';
import {CoreDom} from 'src/core/Dom';
import {EventHelper} from 'src/core/EventHelper';

import {BaseNodeType} from 'src/engine/nodes/_Base';
import {CameraData} from './CameraAnimation';
import {StoreController} from 'src/editor/store/controllers/StoreController';
import {NodeConnectCommand} from 'src/editor/history/commands/NodeConnect';
// import Material from './Material';

export interface ConnectionData {
	node_src_id: string | null;
	node_dest_id: string | null;
	output_index: number;
	input_index: number;
	mouse_start: Vector2Like;
	mouse_progress: Vector2Like;
	active: boolean;
}

export class ConnectionHelper {
	// private node_src: BaseNode
	// private node_dest: BaseNode
	// private input_index: number
	private start_position: Vector2 = new Vector2();
	private move_position: Vector2 = new Vector2();
	private event_helper: EventHelper = new EventHelper(document.body);

	constructor(private data: ConnectionData, private camera_data: CameraData) {}
	set_element(element: HTMLElement) {
		this.event_helper.set_element(element);
	}

	// line() {
	// 	return this._mesh;
	// }

	capture_node_src(node: BaseNodeType, index: number) {
		// this.node_src = node;
		this.data.node_src_id = node.graph_node_id;
		this.data.output_index = index;
		// if(this.both_end_captured()){ this.create_connection()}
	}
	capture_node_dest(node: BaseNodeType, index: number) {
		// this.node_dest = node;
		// this.input_index = index;

		this.data.node_dest_id = node.graph_node_id;
		this.data.input_index = index;
		// if(this.both_end_captured()){ this.create_connection()}
	}
	capture_node_final(node: BaseNodeType) {
		if (this.data.node_dest_id) {
			this.data.node_src_id = node.graph_node_id;
		} else {
			if (this.data.node_src_id) {
				this.data.node_dest_id = node.graph_node_id;
				this.data.input_index = 0; //TODO: connect to the next available node?
			}
		}

		if (this.both_end_captured()) {
			this.create_connection();
		}
		this.reset();
	}
	//
	//
	// MOVE
	//
	//
	move_start(event: MouseEvent): boolean {
		if (!this.has_captured_node()) {
			return false;
		}
		CoreDom.add_drag_classes();

		// this.data.mouse_start = this.event_helper.element_position_old(event).divideScalar(this.camera_data.zoom)
		this.event_helper.element_position(event, this.start_position);
		this.start_position.divideScalar(this.camera_data.zoom);
		this.data.mouse_start.x = this.start_position.x;
		this.data.mouse_start.y = this.start_position.y;

		this.data.mouse_progress = this.data.mouse_start;
		this.data.active = true;
		// this.move_start_position = this.ray_helper.intersect_plane_from_event(event, this.camera);
		// this.move_current_position = this.move_start_position;
		// this._update_position();
		// return this._mesh
		return true;
	}

	move_progress(event: MouseEvent) {
		if (!this.has_captured_node()) {
			return;
		}

		// this.data.mouse_progress = this.event_helper.element_position_old(event).divideScalar(this.camera_data.zoom)
		this.event_helper.element_position(event, this.move_position);
		this.move_position.divideScalar(this.camera_data.zoom);
		this.data.mouse_progress = this.move_position;
		// this.data.mouse_progress.x = this.move_position.x
		// this.data.mouse_progress.y = this.move_position.y

		// this.data.mouse_delta = current_pos.sub(this.start_position)
		// this.data.line_end.x -= this.camera_data.position.x
		// this.data.line_end.y -= this.camera_data.position.y
		// this.move_current_position = this.ray_helper.intersect_plane_from_event(event, this.camera);
		// return this._update_position();
	}

	move_end() {
		if (!this.has_captured_node()) {
			return;
		}
		CoreDom.remove_drag_classes();

		// const intersect = this.ray_helper.intersected_mesh_with_callback(event, 'move_end', this.camera);
		// if (intersect) {
		// 	intersect.callbacks['move_end']();
		// }

		// const command = (() => {
		// 	if ((this.node_src != null) && (this.node_dest != null)) { // both input and output present
		// 	return new History.Command.NodeConnect(this.node_src, this.node_dest, this.input_index);
		// } else if ((this.node_src == null) && (this.node_dest != null)) { // node_dest only
		// 	return new History.Command.NodeConnect(this.node_src, this.node_dest, this.input_index);
		// }
		// })();
		// if (command != null) {
		// 	command.push(this.component);
		// }

		if (this.both_end_captured()) {
			this.create_connection();
		} else {
			if (this.data.node_dest_id != null && this.data.node_src_id == null) {
				this.disconnect_dest();
			}
		}

		this.reset();
	}

	create_connection() {
		if (!this.data.node_src_id || !this.data.node_dest_id) {
			return;
		}
		const node_src = StoreController.scene.graph.node_from_id(this.data.node_src_id) as BaseNodeType;
		const node_dest = StoreController.scene.graph.node_from_id(this.data.node_dest_id) as BaseNodeType;
		const cmd = new NodeConnectCommand(node_src, node_dest, this.data.input_index, this.data.output_index);
		cmd.push();
	}
	disconnect_dest() {
		if (!this.data.node_dest_id) {
			return;
		}
		const node_dest = StoreController.scene.graph.node_from_id(this.data.node_dest_id) as BaseNodeType;
		const cmd = new NodeConnectCommand(null, node_dest, this.data.input_index);
		cmd.push();
	}

	private reset() {
		// this.node_dest = null;
		// this.node_src = null;
		// this.input_index = null;

		this.data.node_src_id = null;
		this.data.node_dest_id = null;
		this.data.mouse_start.x = 0;
		this.data.mouse_start.y = 0;
		this.data.mouse_progress.x = 0;
		this.data.mouse_progress.y = 0;
		// this.data.index = null;
		this.data.active = false;
	}

	private has_captured_node(): boolean {
		return (this.data.node_dest_id || this.data.node_src_id) != null;
	}
	private both_end_captured(): boolean {
		return this.data.node_dest_id != null && this.data.node_src_id != null;
	}

	// _start_position(): Vector3 {
	// 	const pos = this.move_start_position || new Vector3(0,0,0);
	// 	pos.z = 0;
	// 	return pos;
	// }
	// _end_position(): Vector3 {
	// 	const pos = this.move_current_position || new Vector3(0,1,0);
	// 	pos.z = 0;
	// 	return pos;
	// }

	// _create_line() {
	// 	return this._mesh;
	// }

	// _update_position(){
	// 	this._geometry.vertices[0] = this._start_position();
	// 	this._geometry.vertices[1] = this._end_position();
	// 	return this._geometry.verticesNeedUpdate = true;
	// }

	// src_position(): Vector2 {
	// 	if(this.node_src){
	// 		const pos = this.node_src.ui_data().position().clone()

	// 		pos.y += 10+Constants.NODE_UNIT
	// 		return pos
	// 	} else {
	// 		return this.data.line_end
	// 	}
	// }
	// dest_position() {
	// 	if(this.node_dest){
	// 		const pos = this.node_dest.ui_data().position().clone()
	// 		pos.y -= 10
	// 		return pos
	// 	} else {
	// 		return this.data.line_end
	// 	}
	// }
}
