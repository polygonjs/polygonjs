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
import {PerspectiveCameraObjNode} from '../../../obj/PerspectiveCamera';
import {OrthographicCameraObjNode} from '../../../obj/OrthographicCamera';
import {TypeAssert} from '../../../../poly/Assert';
import {Plane} from 'three/src/math/Plane';
import {Vector3} from 'three/src/math/Vector3';

export enum CPUIntersectWith {
	GEOMETRY = 'geometry',
	PLANE = 'plane',
}
export const CPU_INTERSECT_WITH_OPTIONS: CPUIntersectWith[] = [CPUIntersectWith.GEOMETRY, CPUIntersectWith.PLANE];

export class RaycastCPUController {
	private _mouse: Vector2 = new Vector2();
	private _mouse_array: Number2 = [0, 0];
	private _raycaster = new Raycaster();
	private _resolved_target: Object3D | undefined;
	private _intersection_position: Number3 = [0, 0, 0];
	constructor(private _node: RaycastEventNode) {}

	update_mouse(context: EventContext<MouseEvent>) {
		if (!(context.canvas && context.camera_node)) {
			return;
		}
		if (context.event instanceof MouseEvent) {
			this._mouse.x = (context.event.offsetX / context.canvas.offsetWidth) * 2 - 1;
			this._mouse.y = -(context.event.offsetY / context.canvas.offsetHeight) * 2 + 1;
			this._mouse.toArray(this._mouse_array);
			this._node.p.mouse.set(this._mouse_array);
		}
		this._raycaster.setFromCamera(this._mouse, context.camera_node.object);
	}

	process_event(context: EventContext<MouseEvent>) {
		this._prepare_raycaster(context);

		const type = CPU_INTERSECT_WITH_OPTIONS[this._node.pv.intersect_with];
		switch (type) {
			case CPUIntersectWith.GEOMETRY: {
				return this._intersect_with_geometry(context);
			}
			case CPUIntersectWith.PLANE: {
				return this._intersect_with_plane(context);
			}
		}
		TypeAssert.unreachable(type);
	}

	private _plane = new Plane();
	private _plane_intersect_target = new Vector3();
	private _plane_intersect_target_array: Number3 = [0, 0, 0];
	private _intersect_with_plane(context: EventContext<MouseEvent>) {
		this._plane.normal.copy(this._node.pv.plane_direction);
		this._plane.constant = this._node.pv.plane_offset;
		this._raycaster.ray.intersectPlane(this._plane, this._plane_intersect_target);
		this._plane_intersect_target.toArray(this._plane_intersect_target_array);
		this._node.p.position.set(this._plane_intersect_target_array);
		this._node.trigger_hit();
	}

	private _intersect_with_geometry(context: EventContext<MouseEvent>) {
		if (!this._resolved_target) {
			this.update_target();
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
				this._node.trigger_hit();
			} else {
				this._node.trigger_miss();
			}
		}
	}
	private _prepare_raycaster(context: EventContext<MouseEvent>) {
		if (this._node.pv.override_camera) {
			if (this._node.pv.override_ray) {
				this._raycaster.ray.origin.copy(this._node.pv.ray_origin);
				this._raycaster.ray.direction.copy(this._node.pv.ray_direction);
			} else {
				const obj_node = this._node.p.camera.found_node_with_context(NodeContext.OBJ);
				if (obj_node) {
					if (
						obj_node.type == PerspectiveCameraObjNode.type() ||
						obj_node.type == OrthographicCameraObjNode.type()
					) {
						const camera_node = obj_node as PerspectiveCameraObjNode;
						this._raycaster.setFromCamera(this._mouse, camera_node.object);
					}
				}
			}
		} else {
			// we should not expect a camera node here, as the trigger may happen via any event type
			// if (context.camera_node) {
			// 	this._raycaster.setFromCamera(this._mouse, context.camera_node.object);
			// }
		}
	}

	update_target() {
		const node = this._node.p.target.found_node() as BaseObjNodeType;
		if (node) {
			if (node.node_context() == NodeContext.OBJ) {
				this._resolved_target = this._node.pv.traverse_children
					? node.object
					: (node as GeoObjNode).children_display_controller.sop_group;
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
