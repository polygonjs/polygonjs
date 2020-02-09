import {Vector2} from 'three/src/math/Vector2';
import {EventHelper} from 'src/core/EventHelper';

import {BaseNodeType} from 'src/engine/nodes/_Base';
import {Constants} from './Constants';

import {CameraData} from './CameraAnimation';
import {NodeCreateCommand} from 'src/editor/history/commands/NodeCreate';

export interface NodeCreationData {
	active: boolean;
	position: Vector2Like;
}

// TODO: allow pressing esc to cancel
export class NodeCreationHelper {
	private parent_node: BaseNodeType | undefined;
	private _node_type: string | undefined;
	// private position: Vector2
	private move_progress_position: Vector2 = new Vector2();
	private create_position: Vector2 = new Vector2();
	private event_helper: EventHelper = new EventHelper(document.body);

	constructor(private data: NodeCreationData, private camera_data: CameraData) {
		//
	}
	set_element(element: HTMLElement) {
		this.event_helper.set_element(element);
	}

	set_parent_node(parent_node: BaseNodeType) {
		this.parent_node = parent_node;
		this._node_type = undefined;
	}

	get active() {
		return this.data.active;
	}
	get position() {
		return this.data.position;
	}
	activate(node_type: string) {
		this._node_type = node_type;
		this.data.active = true;
	}
	deactivate() {
		//return this._mesh.visible = false;
		this.data.active = false;
	}
	activated(): boolean {
		return this.data.active;
	}

	move_progress(event: MouseEvent) {
		//return if !this.activated() # we don't check if it's activated here
		// as otherwise the position will not be set if the user just closes the tab menu
		// without moving the mouse

		this.event_helper.element_position(event, this.move_progress_position);
		this.move_progress_position.divideScalar(this.camera_data.zoom);
		this.data.position.x = this.move_progress_position.x - 0.5 * Constants.NODE_UNIT;
		this.data.position.y = this.move_progress_position.y - 0.5 * Constants.NODE_UNIT;
		// return this._update_transform();
	}

	// _update_transform() {
	// 	// this._mesh.position.x = this.move_end_position.x;
	// 	// return this._mesh.position.y = this.move_end_position.y;
	// }

	create(event: MouseEvent) {
		if (!this.activated()) {
			return;
		}

		// const cam_pos = this.camera_data.position
		// const pos = {
		// 	x: this.data.position.x/this.camera_data.zoom - cam_pos.x,
		// 	y: this.data.position.y/this.camera_data.zoom - cam_pos.y,
		// }
		this.event_helper.element_position(event, this.create_position);
		this.create_position.divideScalar(this.camera_data.zoom);
		const precision = 1 * Constants.NODE_HEIGHT;
		this.create_position.x = precision * Math.round(this.create_position.x / precision);
		this.create_position.y = precision * Math.round(this.create_position.y / precision);

		if (this.parent_node && this._node_type) {
			const command = new NodeCreateCommand(this.parent_node, this._node_type, this.create_position.clone());
			command.push();
		}

		this.deactivate();
	}

	// _create_rectangle(index: number) {
	// 	this._update_position();
	// }

	// _update_position() {
	// 	const size = 0.5;
	// 	const min = {x: -size, y: -size};
	// 	const max = {x: +size, y: +size};
	// 	const z = 1;
	// 	const positions = [min.x, min.y, z, min.x, max.y, z, max.x, max.y, z, max.x, min.y, z];
	// 	// const position_attribute = this._geometry.getAttribute('position');
	// 	// const { array } = position_attribute;
	// 	// lodash_each(positions, (pos, i)=> array[i] = pos);
	// 	// return position_attribute.needsUpdate = true;
	// }
}
