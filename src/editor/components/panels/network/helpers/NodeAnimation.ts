import lodash_compact from 'lodash/compact';
import {Vector2} from 'three/src/math/Vector2';
import {CoreDom} from 'src/core/Dom';
import {EventHelper} from 'src/core/EventHelper';

import {BaseNodeType} from 'src/engine/nodes/_Base';
import {Constants} from './Constants';
import {CameraData} from './CameraAnimation';
import {NodeMoveCommand} from 'src/editor/history/commands/NodeMove';
import {StoreController} from 'src/editor/store/controllers/StoreController';

export class NodeAnimationHelper {
	private _captured_node: BaseNodeType | undefined;
	private node_start_positions: Vector2[] = [];
	private start_position: Vector2 = new Vector2();
	private move_progress_current_position: Vector2 = new Vector2();
	private move_offset: Vector2 = new Vector2();
	private event_helper: EventHelper = new EventHelper(document.body);
	private _move_in_progress: boolean = false;

	constructor(private camera_data: CameraData) {}
	//
	set_element(element: HTMLElement) {
		this.event_helper.set_element(element);
	}

	capture_node(id: string) {
		const node = StoreController.engine.node(id) || undefined;
		this._captured_node = node;
	}
	private has_captured_nodes(): boolean {
		return this.captured_nodes().length > 0;
	}

	captured_nodes(): BaseNodeType[] {
		if (this._captured_node) {
			const parent = this._captured_node.parent;
			if (parent && parent.children_allowed() && parent.children_controller) {
				if (parent.children_controller.selection.contains(this._captured_node)) {
					return parent.children_controller.selection.nodes();
				}
			}
		}

		return lodash_compact([this._captured_node]);
	}

	//
	//
	// MOVE
	//
	//
	move_start(event: MouseEvent): boolean {
		if (!this.has_captured_nodes()) {
			return false;
		}

		CoreDom.add_drag_classes();
		this._move_in_progress = true;

		const nodes = this.captured_nodes();
		this.node_start_positions = nodes.map((node) => {
			const pos = node.ui_data.position.clone();
			const precision = 1 * Constants.NODE_UNIT;
			pos.x = precision * Math.round(pos.x / precision);
			pos.y = precision * Math.round(pos.y / precision);
			return pos;
		});
		this.event_helper.element_position(event, this.start_position);
		this.start_position.divideScalar(this.camera_data.zoom);

		this.move_offset.set(0, 0); // = new Vector2(0, 0);

		const node_ids = nodes.map((n) => n.graph_node_id);
		StoreController.editor.network.set_node_ids_being_moved(node_ids);

		return true;
	}

	move_progress(event: MouseEvent) {
		if (!this.has_captured_nodes()) {
			return;
		}

		this.event_helper.element_position(event, this.move_progress_current_position);
		this.move_progress_current_position.divideScalar(this.camera_data.zoom);
		// const move_current_position = this.ray_helper.intersect_plane_from_event(event, this.camera);

		this.move_offset.copy(this.move_progress_current_position).sub(this.start_position);
		// this.move_offset.divideScalar(this.camera_data.zoom)

		const nodes = this.captured_nodes();
		nodes.forEach((node, i) => {
			const new_pos = this.node_start_positions[i].clone().add(this.move_offset);
			node.ui_data.set_position(new_pos);
		});
	}

	move_end(/*event: MouseEvent*/) {
		CoreDom.remove_drag_classes();

		const nodes = this.captured_nodes();
		// snap
		const precision = 1 * Constants.NODE_UNIT;
		if (nodes.length > 0 && this.move_offset) {
			const offset = this.move_offset.clone();
			offset.x = precision * Math.round(offset.x / precision);
			offset.y = precision * Math.round(offset.y / precision);

			nodes.forEach((node, i) => {
				return node.ui_data.set_position(this.node_start_positions[i]);
			});

			if (Math.abs(offset.x) > 0 || Math.abs(offset.y) > 0) {
				const command = new NodeMoveCommand(nodes, offset);
				command.push();
			}
		}

		// release
		StoreController.editor.network.reset_node_ids_being_moved();
		this._captured_node = undefined;
		this.node_start_positions = [];
		// this.start_position = null;
		// this.move_offset = null;
		this._move_in_progress = false;
	}

	move_in_progress(): boolean {
		return this._move_in_progress;
	}
	mouse_barely_moved(): boolean {
		// if (!(this.start_position != null && this.move_offset != null)) {
		// 	return true;
		// }

		return this.move_offset.length() < 5;

		// const delta = {
		// 	x: this.move_offset.x,
		// 	y: this.move_offset.y,
		// };
		// const max_dist = 0.05;
		// return Math.abs(delta.x) < max_dist && Math.abs(delta.y) < max_dist;
	}
}
