import {Number2, Number3} from '../../../../../types/GlobalTypes';
import {EventContext} from '../../../../scene/utils/events/_BaseEventsController';
import {RaycastEventNode, TargetType, TARGET_TYPES} from '../../Raycast';
import {Object3D} from 'three';
import {Intersection} from 'three';
import {NodeContext} from '../../../../poly/NodeContext';
import {BaseObjNodeType} from '../../../obj/_Base';
import {GeoObjNode} from '../../../obj/Geo';
import {TypeAssert} from '../../../../poly/Assert';
import {Plane} from 'three';
import {Vector3} from 'three';
import {ParamType} from '../../../../poly/ParamType';
import {AttribType, ATTRIBUTE_TYPES} from '../../../../../core/geometry/Constant';
import {Vector3Param} from '../../../../params/Vector3';
import {RaycastCPUVelocityController} from './VelocityController';
import {CoreType} from '../../../../../core/Type';

import {CPUIntersectWith, CPU_INTERSECT_WITH_OPTIONS} from './CpuConstants';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {IntersectDataEventNode} from '../../IntersectData';
import {BaseRaycastController} from './BaseRaycastController';

export class RaycastCPUController extends BaseRaycastController {
	// private _offset: CursorOffset = {offsetX: 0, offsetY: 0};
	// private _mouse: Vector2 = new Vector2();
	private _cursorArray: Number2 = [0, 0];
	// private _raycaster = createRaycaster();
	private _resolvedTargets: Object3D[] | undefined;

	public readonly velocityController: RaycastCPUVelocityController;
	constructor(private _node: RaycastEventNode) {
		super();
		this.velocityController = new RaycastCPUVelocityController(this._node);
	}

	updateMouse(eventContext: EventContext<MouseEvent | DragEvent | PointerEvent | TouchEvent>) {
		const viewer = eventContext.viewer;
		if (!viewer) {
			return;
		}
		const camera = viewer.camera();
		if (!camera) {
			return;
		}

		this._cursorHelper.setCursorForCPU(eventContext, this._cursor);
		if (isBooleanTrue(this._node.pv.tmouse)) {
			this._cursor.toArray(this._cursorArray);
			this._node.p.mouse.set(this._cursorArray);
		}
		// this._updateFromCursor(canvas);
		viewer.raycaster.setFromCamera(this._cursor, camera);
	}
	// protected override _remapCursor() {
	// 	this._cursor.x = this._cursor.x * 2 - 1;
	// 	this._cursor.y = -this._cursor.y * 2 + 1;
	// }
	// private _updateFromCursor(canvas: HTMLCanvasElement){
	// 	if (canvas.offsetWidth <= 0 || canvas.offsetHeight <= 0) {
	// 		// the canvas can have a size of 0 if it has been removed from the scene
	// 		this._mouse.set(0, 0);
	// 	} else {
	// 		this._mouse.x = (this._offset.offsetX / canvas.offsetWidth) * 2 - 1;
	// 		this._mouse.y = -(this._offset.offsetY / canvas.offsetHeight) * 2 + 1;
	// 		this._mouse.toArray(this._mouse_array);
	// 	}
	// 	// there can be some conditions leading to an infinite mouse number, so we check here what we got
	// 	if (isNaN(this._mouse.x) || !isFinite(this._mouse.x) || isNaN(this._mouse.y) || !isFinite(this._mouse.y)) {
	// 		console.warn('invalid number detected');
	// 		console.warn(
	// 			this._mouse.toArray(),
	// 			this._offset.offsetX,
	// 			this._offset.offsetY,
	// 			canvas.offsetWidth,
	// 			canvas.offsetHeight
	// 		);
	// 		return;
	// 	}
	// 	if (isBooleanTrue(this._node.pv.tmouse)) {
	// 		this._node.p.mouse.set(this._mouse_array);
	// 	}
	// };

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
	private _intersectPlane(eventContext: EventContext<MouseEvent>) {
		const viewer = eventContext.viewer;
		if (!viewer) {
			return;
		}
		this._plane.normal.copy(this._node.pv.planeDirection);
		this._plane.constant = this._node.pv.planeOffset;
		viewer.raycaster.ray.intersectPlane(this._plane, this._plane_intersect_target);

		this._setPositionParam(this._plane_intersect_target);
		this._node.triggerHit(eventContext);
	}

	private _intersections: Intersection[] = [];
	private _intersectGeometry(eventContext: EventContext<MouseEvent>) {
		const viewer = eventContext.viewer;
		if (!viewer) {
			return;
		}
		if (!this._resolvedTargets) {
			this.updateTarget();
		}
		if (this._resolvedTargets) {
			// clear array before
			this._intersections.length = 0;
			const intersections = viewer.raycaster.intersectObjects(
				this._resolvedTargets,
				isBooleanTrue(this._node.pv.traverseChildren),
				this._intersections
			);
			const intersection = intersections[0];
			if (intersection) {
				this._node.scene().batchUpdates(() => {
					if (isBooleanTrue(this._node.pv.tposition)) {
						this._setPositionParam(intersection.point);
					}

					if (isBooleanTrue(this._node.pv.geoAttribute)) {
						this._resolveIntersectAttribute(intersection);
					}
				});
				eventContext.value = {intersect: intersection};
				this._node.triggerHit(eventContext);
			} else {
				this._node.triggerMiss(eventContext);
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
	private _hitPositionArray: Number3 = [0, 0, 0];
	private _setPositionParam(hit_position: Vector3) {
		hit_position.toArray(this._hitPositionArray);
		if (isBooleanTrue(this._node.pv.tpositionTarget)) {
			if (this._node.scene().timeController.playing()) {
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
				this._found_position_target_param.set(this._hitPositionArray);
			}
		} else {
			this._node.p.position.set(this._hitPositionArray);
		}

		this.velocityController.process(hit_position);
	}

	private _prepareRaycaster(eventContext: EventContext<MouseEvent>) {
		const viewer = eventContext.viewer;
		if (!viewer) {
			return;
		}
		const pointsParam = viewer.raycaster.params.Points;
		if (pointsParam) {
			pointsParam.threshold = this._node.pv.pointsThreshold;
		}

		// let camera = context.camera;
		// if (isBooleanTrue(this._node.pv.overrideCamera)) {
		// 	if (isBooleanTrue(this._node.pv.overrideRay)) {
		// 		this._raycaster.ray.origin.copy(this._node.pv.rayOrigin);
		// 		this._raycaster.ray.direction.copy(this._node.pv.rayDirection);
		// 	} else {
		// 		const foundCameraNode = this._node.pv.camera.nodeWithContext(NodeContext.OBJ, this._node.states.error);
		// 		if (foundCameraNode) {
		// 			if ((CAMERA_TYPES as string[]).includes(foundCameraNode.type())) {
		// 				cameraNode = (<unknown>foundCameraNode) as Readonly<BaseCameraObjNodeType>;
		// 			}
		// 		}
		// 	}
		// }

		// if (cameraNode && !isBooleanTrue(this._node.pv.overrideRay)) {
		// 	cameraNode.prepareRaycaster(this._cursor, this._raycaster);
		// }
	}

	updateTarget() {
		const targetType = TARGET_TYPES[this._node.pv.targetType];
		switch (targetType) {
			case TargetType.NODE: {
				return this._updateTargetFromNode();
			}
			case TargetType.SCENE_GRAPH: {
				return this._updateTargetFromSceneGraph();
			}
		}
		TypeAssert.unreachable(targetType);
	}
	private _updateTargetFromNode() {
		const node = this._node.p.targetNode.value.nodeWithContext(NodeContext.OBJ) as BaseObjNodeType;
		if (node) {
			const found_obj = isBooleanTrue(this._node.pv.traverseChildren)
				? node.object
				: (node as GeoObjNode).childrenDisplayController.sopGroup();
			if (found_obj) {
				this._resolvedTargets = [found_obj];
			} else {
				this._resolvedTargets = undefined;
			}
		} else {
			this._node.states.error.set('node is not an object');
		}
	}
	private _updateTargetFromSceneGraph() {
		const objects: Object3D[] = this._node.scene().objectsByMask(this._node.pv.objectMask);
		if (objects.length > 0) {
			this._resolvedTargets = objects;
		} else {
			this._resolvedTargets = undefined;
		}
	}

	static PARAM_CALLBACK_updateTarget(node: RaycastEventNode) {
		node.cpuController.updateTarget();
	}
}
