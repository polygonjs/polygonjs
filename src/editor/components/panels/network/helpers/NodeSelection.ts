import {Vector2} from 'three/src/math/Vector2';
import {Box2} from 'three/src/math/Box2';
import {CoreDom} from 'src/core/Dom';
import {EventHelper} from 'src/core/EventHelper';
import {Constants} from './Constants';

import {BaseNodeType} from 'src/engine/nodes/_Base';
import {CameraData} from './CameraAnimation';
import {NodeSelectCommand, SelectionMethod} from 'src/editor/history/commands/NodeSelect';

interface NodeSelectionData {
	start: Vector2Like;
	end: Vector2Like;
	active: boolean;
}

export class NodeSelectionHelper {
	private event_helper: EventHelper = new EventHelper(document.body);

	private parent_node: BaseNodeType | undefined;
	private method: SelectionMethod = SelectionMethod.ADD;
	private start_position: Vector2 = new Vector2();
	private end_position: Vector2 = new Vector2();
	private node_around_mouse_position: Vector2 = new Vector2();

	constructor(private data: NodeSelectionData, private camera_data: CameraData) {}

	set_element(element: HTMLElement) {
		this.event_helper.set_element(element);
	}

	set_parent_node(parent_node: BaseNodeType) {
		this.parent_node = parent_node;
	}

	capture_node(node: BaseNodeType) {
		this.capture_nodes([node]);
	}
	capture_nodes(nodes: BaseNodeType[]) {
		if (this.parent_node && this.parent_node.children_allowed() && this.parent_node.children_controller) {
			if (!this.parent_node.children_controller.selection.equals(nodes)) {
				const command = new NodeSelectCommand(this.parent_node, nodes, this.method);
				command.push();
			} else {
				// console.log("selection has not changed");
			}
		} else {
			console.warn('selection has no parent node');
		}
	}
	clear_selection() {
		this.capture_nodes([]);
	}

	mouse_barely_moved(event: MouseEvent): boolean {
		// if (!((this.start_position != null) && (this.end_position != null))) { return true; }

		// const delta = {
		// 	x: this.end_position.x - this.start_position.x,
		// 	y: this.end_position.y - this.start_position.y
		// };
		const delta = this.start_position.distanceTo(this.end_position);
		return delta < 3;

		// const max_dist = 0.05;
		// return (Math.abs(delta.x) < max_dist) && (Math.abs(delta.y) < max_dist);
	}

	//
	//
	// MOVE
	//
	//
	move_start(event: MouseEvent) {
		CoreDom.add_drag_classes();

		this.event_helper.element_position(event, this.start_position);
		this.start_position.divideScalar(this.camera_data.zoom);
		// this.start_position.multiplyScalar(this.camera_data.zoom)
		this.data.start.x = this.start_position.x;
		this.data.start.y = this.start_position.y;
		this.data.end.x = this.data.start.x;
		this.data.end.y = this.data.start.y;
		this.data.active = true;
		// this.move_start_position = this.ray_helper.intersect_plane_from_event(event, this.camera);
		// this.move_end_position = this.move_start_position;
		// this._update_position();
		// return this._mesh.visible = true;
	}

	move_progress(event: MouseEvent) {
		if (!this.data.active) {
			return;
		}

		this.event_helper.element_position(event, this.end_position);
		this.end_position.divideScalar(this.camera_data.zoom);
		this.data.end.x = this.end_position.x;
		this.data.end.y = this.end_position.y;
		// this.move_end_position = this.ray_helper.intersect_plane_from_event(event, this.camera);
		// this._update_position();
	}

	move_end(event: MouseEvent, move_in_progress: boolean, move_barely_moved: boolean) {
		CoreDom.remove_drag_classes();
		// this.move_end_position = this.ray_helper.intersect_plane_from_event(event, this.camera);

		if (event.ctrlKey) {
			this.method = SelectionMethod.ADD;
		} else {
			if (event.shiftKey) {
				this.method = SelectionMethod.REMOVE;
			} else {
				this.method = SelectionMethod.OVERRIDE;
			}
		}

		let nodes = this.nodes_inside_box();
		if (move_barely_moved) {
			const found_node = this.node_around_mouse(event);
			if (found_node) {
				nodes = [found_node];
			}
		}

		if (!move_in_progress || (move_in_progress && move_barely_moved)) {
			if (this.mouse_barely_moved(event)) {
				if (nodes.length == 0) {
					this.clear_selection();
				} else {
					this.capture_nodes(nodes);
				}
			} else {
				if (nodes.length > 0) {
					this.capture_nodes(nodes);
				} else {
					this.clear_selection();
				}
			}
		}

		// this._mesh.visible = false;
		// this.start_position = null
		// this.end_position = null
		this.data.active = false;
	}

	// _position_from_event: (event)->
	// 	{
	// 		x: event.screenX,
	// 		y: event.screenY,
	// 	}

	node_around_mouse(event: MouseEvent) {
		this.event_helper.element_position(event, this.node_around_mouse_position);
		this.node_around_mouse_position.divideScalar(this.camera_data.zoom);
		const corner = this.node_around_mouse_position;
		const box = new Box2(corner, corner);
		let found_node = null;
		if (this.parent_node) {
			for (let node of this.parent_node.children()) {
				const node_box = this.node_box(node);
				if (box.intersectsBox(node_box)) {
					found_node = found_node || node;
				}
			}
		}
		return found_node;
	}

	box(): Box2 {
		const r = this.data;
		const min = new Vector2(Math.min(r.end.x, r.start.x), Math.min(r.end.y, r.start.y));
		const max = new Vector2(Math.max(r.end.x, r.start.x), Math.max(r.end.y, r.start.y));
		// const size = new Vector2(
		// 	Math.abs( r.end.x - r.start.x ),
		// 	Math.abs( r.end.y - r.start.y )
		// )
		return new Box2(min, max);
	}

	private nodes_inside_box(): BaseNodeType[] {
		// const min = this._min_position();
		// const max = this._max_position();

		// const bbox = new Box2(
		// 	new Vector2(min.x, min.y),
		// 	new Vector2(max.x, max.y)
		// 	);
		const box = this.box();
		// const cam_pos = this.camera_data.position
		// const camera_position_offset = new Vector2(cam_pos.x, cam_pos.y)
		const nodes = [];

		if (this.parent_node) {
			for (let node of this.parent_node.children()) {
				// const pos = node.ui_data().position();
				// const adjusted_pos = pos.clone().multiplyScalar(50).sub(this.camera_data.position)
				const node_box = this.node_box(node); //.translate(camera_position_offset)
				if (box.intersectsBox(node_box)) {
					nodes.push(node);
				}
			}
		}
		return nodes;
	}

	private node_box(node: BaseNodeType): Box2 {
		// const pos_mult = Constants.NODE_POS_MULT
		const size = Constants.NODE_UNIT;
		const pos = node
			.ui_data()
			.position()
			.clone(); //.multiplyScalar(pos_mult)
		return new Box2(pos.clone().subScalar(size * 0.5), pos.clone().addScalar(size * 0.5));
	}
}
