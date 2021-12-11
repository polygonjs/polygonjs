import {Number2, Number3} from '../../../../../types/GlobalTypes';
import {EventContext} from '../../../../scene/utils/events/_BaseEventsController';
import {RaycastEventNode, TargetType, TARGET_TYPES} from '../../Raycast';
import {Object3D} from 'three/src/core/Object3D';
import {Vector2} from 'three/src/math/Vector2';
import {Raycaster, Intersection} from 'three/src/core/Raycaster';
import {NodeContext} from '../../../../poly/NodeContext';
import {BaseObjNodeType} from '../../../obj/_Base';
import {GeoObjNode} from '../../../obj/Geo';
import {TypeAssert} from '../../../../poly/Assert';
import {Plane} from 'three/src/math/Plane';
import {Vector3} from 'three/src/math/Vector3';
import {ParamType} from '../../../../poly/ParamType';
import {AttribType, ATTRIBUTE_TYPES} from '../../../../../core/geometry/Constant';
import {BaseCameraObjNodeType} from '../../../obj/_BaseCamera';
import {Vector3Param} from '../../../../params/Vector3';
import {Poly} from '../../../../Poly';
import {RaycastCPUVelocityController} from './VelocityController';
import {CoreType} from '../../../../../core/Type';

import {CPUIntersectWith, CPU_INTERSECT_WITH_OPTIONS} from './CpuConstants';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {RaycasterForBVH} from '../../../../operations/sop/utils/Bvh/three-mesh-bvh';
import {IntersectDataEventNode} from '../../IntersectData';

interface CursorOffset {
	offsetX: number;
	offsetY: number;
}
interface CursorPage {
	pageX: number;
	pageY: number;
}

function setEventOffset(cursorPage: CursorPage, canvas: HTMLCanvasElement, offset: CursorOffset) {
	var rect = canvas.getBoundingClientRect();
	offset.offsetX = cursorPage.pageX - rect.left;
	offset.offsetY = cursorPage.pageY - rect.top;
}
function createRaycaster() {
	const raycaster = new Raycaster() as RaycasterForBVH;
	raycaster.firstHitOnly = true;
	return raycaster;
}

export class RaycastCPUController {
	private _offset: CursorOffset = {offsetX: 0, offsetY: 0};
	private _mouse: Vector2 = new Vector2();
	private _mouse_array: Number2 = [0, 0];
	private _raycaster = createRaycaster();
	private _resolved_targets: Object3D[] | undefined;

	public readonly velocity_controller: RaycastCPUVelocityController;
	constructor(private _node: RaycastEventNode) {
		this.velocity_controller = new RaycastCPUVelocityController(this._node);
	}

	updateMouse(context: EventContext<MouseEvent | DragEvent | PointerEvent | TouchEvent>) {
		const canvas = context.viewer?.canvas();
		const cameraNode = context.cameraNode;
		if (!(canvas && cameraNode)) {
			return;
		}
		const updateFromCursor = (cursor: CursorOffset) => {
			this._mouse.x = (cursor.offsetX / canvas.offsetWidth) * 2 - 1;
			this._mouse.y = -(cursor.offsetY / canvas.offsetHeight) * 2 + 1;
			this._mouse.toArray(this._mouse_array);
			this._node.p.mouse.set(this._mouse_array);
		};
		const event = context.event;
		if (event instanceof MouseEvent || event instanceof DragEvent || event instanceof PointerEvent) {
			setEventOffset(event, canvas, this._offset);
		}
		if (
			window.TouchEvent /* check first that TouchEvent is defined, since it does on firefox desktop */ &&
			event instanceof TouchEvent
		) {
			const touch = event.touches[0];
			setEventOffset(touch, canvas, this._offset);
		}
		updateFromCursor(this._offset);
		this._raycaster.setFromCamera(this._mouse, cameraNode.object);
	}

	processEvent(context: EventContext<MouseEvent>) {
		this._prepareRaycaster(context);

		const type = CPU_INTERSECT_WITH_OPTIONS[this._node.pv.intersectWith];
		switch (type) {
			case CPUIntersectWith.GEOMETRY: {
				return this._intersectGeometry(context);
			}
			case CPUIntersectWith.PLANE: {
				return this._intersectPlane(context);
			}
		}
		TypeAssert.unreachable(type);
	}

	private _plane = new Plane();
	private _plane_intersect_target = new Vector3();
	private _intersectPlane(context: EventContext<MouseEvent>) {
		this._plane.normal.copy(this._node.pv.planeDirection);
		this._plane.constant = this._node.pv.planeOffset;
		this._raycaster.ray.intersectPlane(this._plane, this._plane_intersect_target);

		this._setPositionParam(this._plane_intersect_target);
		this._node.triggerHit(context);
	}

	private _intersections: Intersection[] = [];
	private _intersectGeometry(context: EventContext<MouseEvent>) {
		if (!this._resolved_targets) {
			this.update_target();
		}
		if (this._resolved_targets) {
			// clear array before
			this._intersections.length = 0;
			const intersections = this._raycaster.intersectObjects(
				this._resolved_targets,
				isBooleanTrue(this._node.pv.traverseChildren),
				this._intersections
			);
			const intersection = intersections[0];
			if (intersection) {
				if (isBooleanTrue(this._node.pv.tposition)) {
					this._setPositionParam(intersection.point);
				}

				if (isBooleanTrue(this._node.pv.geoAttribute)) {
					this._resolveIntersectAttribute(intersection);
				}
				context.value = {intersect: intersection};
				this._node.triggerHit(context);
			} else {
				this._node.triggerMiss(context);
			}
		}
	}
	private _resolveIntersectAttribute(intersection: Intersection) {
		const attribType = ATTRIBUTE_TYPES[this._node.pv.geoAttributeType];
		let attribValue = IntersectDataEventNode.resolveObjectAttribute(intersection, this._node.pv.geoAttributeName);
		if (attribValue == null) {
			attribValue = IntersectDataEventNode.resolveGeometryAttribute(
				intersection,
				this._node.pv.geoAttributeName,
				attribType
			);
		}
		if (attribValue != null) {
			switch (attribType) {
				case AttribType.NUMERIC: {
					this._node.p.geoAttributeValue1.set(attribValue);
					return;
				}
				case AttribType.STRING: {
					if (CoreType.isString(attribValue)) {
						this._node.p.geoAttributeValues.set(attribValue);
					}
					return;
				}
			}
			TypeAssert.unreachable(attribType);
		}
	}

	private _found_position_target_param: Vector3Param | undefined;
	private _hit_position_array: Number3 = [0, 0, 0];
	private _setPositionParam(hit_position: Vector3) {
		hit_position.toArray(this._hit_position_array);
		if (isBooleanTrue(this._node.pv.tpositionTarget)) {
			if (Poly.playerMode()) {
				this._found_position_target_param =
					this._found_position_target_param || this._node.pv.positionTarget.paramWithType(ParamType.VECTOR3);
			} else {
				// Do not cache the param in the editor, but fetch it directly from the operator_path.
				// The reason is that params are very prone to disappear and be re-generated,
				// Such as spare params created by Gl Builders
				const target_param = this._node.pv.positionTarget;
				this._found_position_target_param = target_param.paramWithType(ParamType.VECTOR3);
			}
			if (this._found_position_target_param) {
				this._found_position_target_param.set(this._hit_position_array);
			}
		} else {
			this._node.p.position.set(this._hit_position_array);
		}

		this.velocity_controller.process(hit_position);
	}

	private _prepareRaycaster(context: EventContext<MouseEvent>) {
		const points_param = this._raycaster.params.Points;
		if (points_param) {
			points_param.threshold = this._node.pv.pointsThreshold;
		}

		let camera_node: Readonly<BaseCameraObjNodeType> | undefined = context.cameraNode;
		if (isBooleanTrue(this._node.pv.overrideCamera)) {
			if (isBooleanTrue(this._node.pv.overrideRay)) {
				this._raycaster.ray.origin.copy(this._node.pv.rayOrigin);
				this._raycaster.ray.direction.copy(this._node.pv.rayDirection);
			} else {
				const found_camera_node = this._node.p.camera.found_node_with_context(NodeContext.OBJ);
				if (found_camera_node) {
					camera_node = (<unknown>found_camera_node) as Readonly<BaseCameraObjNodeType>;
				}
			}
		}

		if (camera_node && !isBooleanTrue(this._node.pv.overrideRay)) {
			camera_node.prepareRaycaster(this._mouse, this._raycaster);
		}
	}

	update_target() {
		const targetType = TARGET_TYPES[this._node.pv.targetType];
		switch (targetType) {
			case TargetType.NODE: {
				return this._update_target_from_node();
			}
			case TargetType.SCENE_GRAPH: {
				return this._update_target_from_scene_graph();
			}
		}
		TypeAssert.unreachable(targetType);
	}
	private _update_target_from_node() {
		const node = this._node.p.targetNode.value.nodeWithContext(NodeContext.OBJ) as BaseObjNodeType;
		if (node) {
			const found_obj = isBooleanTrue(this._node.pv.traverseChildren)
				? node.object
				: (node as GeoObjNode).childrenDisplayController.sopGroup();
			if (found_obj) {
				this._resolved_targets = [found_obj];
			} else {
				this._resolved_targets = undefined;
			}
		} else {
			this._node.states.error.set('node is not an object');
		}
	}
	private _update_target_from_scene_graph() {
		const objects: Object3D[] = this._node.scene().objectsByMask(this._node.pv.objectMask);
		if (objects.length > 0) {
			this._resolved_targets = objects;
		} else {
			this._resolved_targets = undefined;
		}
	}

	async update_position_target() {
		if (this._node.p.positionTarget.isDirty()) {
			await this._node.p.positionTarget.compute();
		}
	}
	static PARAM_CALLBACK_update_target(node: RaycastEventNode) {
		node.cpuController.update_target();
	}
	// static PARAM_CALLBACK_update_position_target(node: RaycastEventNode) {
	// 	node.cpu_controller.update_position_target();
	// }

	static PARAM_CALLBACK_print_resolve(node: RaycastEventNode) {
		node.cpuController.print_resolve();
	}
	private print_resolve() {
		this.update_target();
		console.log(this._resolved_targets);
	}
}
