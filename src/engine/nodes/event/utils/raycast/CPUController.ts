import {EventContext} from '../../../../scene/utils/events/_BaseEventsController';
import {RaycastEventNode} from '../../Raycast';
import {Object3D} from 'three/src/core/Object3D';
import {Vector2} from 'three/src/math/Vector2';
import {Raycaster} from 'three/src/core/Raycaster';
import {NodeContext} from '../../../../poly/NodeContext';
import {BaseObjNodeType} from '../../../obj/_Base';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {GeoObjNode} from '../../../obj/Geo';

export class RaycastCPUController {
	private _mouse: Vector2 = new Vector2();
	private _mouse_array: Number2 = [0, 0];
	private _raycaster = new Raycaster();
	private _resolved_target: Object3D | undefined;
	private _intersection_position: Number3 = [0, 0, 0];
	constructor(private _node: RaycastEventNode) {}
	process_event(context: EventContext<MouseEvent>) {
		if (!(context.canvas && context.camera_node)) {
			return;
		}
		if (context.event instanceof MouseEvent) {
			this._mouse.x = (context.event.offsetX / context.canvas.offsetWidth) * 2 - 1;
			this._mouse.y = -(context.event.offsetY / context.canvas.offsetHeight) * 2 + 1;
			this._mouse.toArray(this._mouse_array);
			this._node.p.mouse.set(this._mouse_array);
		}
		if (this._node.pv.use_camera) {
			this._raycaster.setFromCamera(this._mouse, context.camera_node.object);
		} else {
			// this._raycaster.ray.origin.copy(this.pv.ray_origin)
			// this._raycaster.ray.direction.copy(this.pv.ray_direction)
		}
		if (this._resolved_target) {
			const intersections = this._raycaster.intersectObject(this._resolved_target, true);
			const intersection = intersections[0];
			if (intersection) {
				intersection.point.toArray(this._intersection_position);
				this._node.p.position.set(this._intersection_position);

				if (this._node.pv.geo_attribute == true) {
					const geometry = (intersection.object as Mesh).geometry as BufferGeometry;
					if (geometry) {
						const attribute = geometry.getAttribute(this._node.pv.geo_attribute_name);
						if (attribute) {
							const val = attribute.array[0];
							if (val != null) {
								this._node.p.geo_attribute_value.set(val);
							}
						}
					}
				}
			}
		}
	}
	update_target() {
		const node = this._node.p.target.found_node() as BaseObjNodeType;
		if (node) {
			if (node.node_context() == NodeContext.OBJ) {
				this._resolved_target = this._node.pv.traverse_children ? node.object : (node as GeoObjNode).sop_group;
			} else {
				this._node.states.error.set('target is not an obj');
			}
		} else {
			this._node.states.error.set('no target found');
		}
	}

	static PARAM_CALLBACK_update_target(node: RaycastEventNode) {
		node.cpu_controller.update_target();
	}
}
