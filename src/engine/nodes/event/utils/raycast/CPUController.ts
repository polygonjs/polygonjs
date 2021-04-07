import {Number2, Number3} from '../../../../../types/GlobalTypes';
import {EventContext} from '../../../../scene/utils/events/_BaseEventsController';
import {RaycastEventNode, TargetType, TARGET_TYPES} from '../../Raycast';
import {Object3D} from 'three/src/core/Object3D';
import {Vector2} from 'three/src/math/Vector2';
import {Raycaster, Intersection} from 'three/src/core/Raycaster';
import {NodeContext} from '../../../../poly/NodeContext';
import {BaseObjNodeType} from '../../../obj/_Base';
import {Mesh} from 'three/src/objects/Mesh';
import {Points} from 'three/src/objects/Points';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {GeoObjNode} from '../../../obj/Geo';
import {TypeAssert} from '../../../../poly/Assert';
import {Plane} from 'three/src/math/Plane';
import {Vector3} from 'three/src/math/Vector3';
import {ParamType} from '../../../../poly/ParamType';
import {AttribType, ATTRIBUTE_TYPES} from '../../../../../core/geometry/Constant';
import {objectTypeFromConstructor, ObjectType} from '../../../../../core/geometry/Constant';
import {CoreGeometry} from '../../../../../core/geometry/Geometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {Triangle} from 'three/src/math/Triangle';
import {BaseCameraObjNodeType} from '../../../obj/_BaseCamera';
import {Vector3Param} from '../../../../params/Vector3';
import {Poly} from '../../../../Poly';
import {RaycastCPUVelocityController} from './VelocityController';
import {CoreType} from '../../../../../core/Type';

import {CPUIntersectWith, CPU_INTERSECT_WITH_OPTIONS} from './CpuConstants';
import {isBooleanTrue} from '../../../../../core/BooleanValue';

export class RaycastCPUController {
	private _mouse: Vector2 = new Vector2();
	private _mouse_array: Number2 = [0, 0];
	private _raycaster = new Raycaster();
	private _resolved_targets: Object3D[] | undefined;

	public readonly velocity_controller: RaycastCPUVelocityController;
	constructor(private _node: RaycastEventNode) {
		this.velocity_controller = new RaycastCPUVelocityController(this._node);
	}

	update_mouse(context: EventContext<MouseEvent>) {
		const canvas = context.viewer?.canvas();
		if (!(canvas && context.cameraNode)) {
			return;
		}
		if (context.event instanceof MouseEvent) {
			this._mouse.x = (context.event.offsetX / canvas.offsetWidth) * 2 - 1;
			this._mouse.y = -(context.event.offsetY / canvas.offsetHeight) * 2 + 1;
			this._mouse.toArray(this._mouse_array);
			this._node.p.mouse.set(this._mouse_array);
		}
		this._raycaster.setFromCamera(this._mouse, context.cameraNode.object);
	}

	processEvent(context: EventContext<MouseEvent>) {
		this._prepareRaycaster(context);

		const type = CPU_INTERSECT_WITH_OPTIONS[this._node.pv.intersectWith];
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
	private _intersect_with_plane(context: EventContext<MouseEvent>) {
		this._plane.normal.copy(this._node.pv.planeDirection);
		this._plane.constant = this._node.pv.planeOffset;
		this._raycaster.ray.intersectPlane(this._plane, this._plane_intersect_target);

		this._set_position_param(this._plane_intersect_target);
		this._node.trigger_hit(context);
	}

	private _intersections: Intersection[] = [];
	private _intersect_with_geometry(context: EventContext<MouseEvent>) {
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
				this._set_position_param(intersection.point);

				if (isBooleanTrue(this._node.pv.geoAttribute)) {
					this._resolve_geometry_attribute(intersection);
				}
				context.value = {intersect: intersection};
				this._node.trigger_hit(context);
			} else {
				this._node.trigger_miss(context);
			}
		}
	}
	private _resolve_geometry_attribute(intersection: Intersection) {
		const attrib_type = ATTRIBUTE_TYPES[this._node.pv.geoAttributeType];
		const val = RaycastCPUController.resolve_geometry_attribute(
			intersection,
			this._node.pv.geoAttributeName,
			attrib_type
		);
		if (val != null) {
			switch (attrib_type) {
				case AttribType.NUMERIC: {
					this._node.p.geoAttributeValue1.set(val);
					return;
				}
				case AttribType.STRING: {
					if (CoreType.isString(val)) {
						this._node.p.geoAttributeValues.set(val);
					}
					return;
				}
			}
			TypeAssert.unreachable(attrib_type);
		}
	}
	static resolve_geometry_attribute(intersection: Intersection, attribute_name: string, attrib_type: AttribType) {
		const object_type = objectTypeFromConstructor(intersection.object.constructor);
		switch (object_type) {
			case ObjectType.MESH:
				return this.resolve_geometry_attribute_for_mesh(intersection, attribute_name, attrib_type);
			case ObjectType.POINTS:
				return this.resolve_geometry_attribute_for_point(intersection, attribute_name, attrib_type);
		}
		// TODO: have the raycast cpu controller work with all object types
		// TypeAssert.unreachable(object_type)
	}

	private static _vA = new Vector3();
	private static _vB = new Vector3();
	private static _vC = new Vector3();
	private static _uvA = new Vector2();
	private static _uvB = new Vector2();
	private static _uvC = new Vector2();
	private static _hitUV = new Vector2();
	static resolve_geometry_attribute_for_mesh(
		intersection: Intersection,
		attribute_name: string,
		attrib_type: AttribType
	) {
		const geometry = (intersection.object as Mesh).geometry as BufferGeometry;
		if (geometry) {
			const attribute = geometry.getAttribute(attribute_name) as BufferAttribute;
			if (attribute) {
				switch (attrib_type) {
					case AttribType.NUMERIC: {
						const position = geometry.getAttribute('position') as BufferAttribute;
						if (intersection.face) {
							this._vA.fromBufferAttribute(position, intersection.face.a);
							this._vB.fromBufferAttribute(position, intersection.face.b);
							this._vC.fromBufferAttribute(position, intersection.face.c);
							this._uvA.fromBufferAttribute(attribute, intersection.face.a);
							this._uvB.fromBufferAttribute(attribute, intersection.face.b);
							this._uvC.fromBufferAttribute(attribute, intersection.face.c);
							intersection.uv = Triangle.getUV(
								intersection.point,
								this._vA,
								this._vB,
								this._vC,
								this._uvA,
								this._uvB,
								this._uvC,
								this._hitUV
							);
							return this._hitUV.x;
						}
						return;
					}
					case AttribType.STRING: {
						const core_geometry = new CoreGeometry(geometry);
						const core_point = core_geometry.points()[0];
						if (core_point) {
							return core_point.stringAttribValue(attribute_name);
						}
						return;
					}
				}
				TypeAssert.unreachable(attrib_type);
			}
		}
	}
	static resolve_geometry_attribute_for_point(
		intersection: Intersection,
		attribute_name: string,
		attrib_type: AttribType
	) {
		const geometry = (intersection.object as Points).geometry as BufferGeometry;
		if (geometry && intersection.index != null) {
			switch (attrib_type) {
				case AttribType.NUMERIC: {
					const attribute = geometry.getAttribute(attribute_name);
					if (attribute) {
						return attribute.array[intersection.index];
					}
					return;
				}
				case AttribType.STRING: {
					const core_geometry = new CoreGeometry(geometry);
					const core_point = core_geometry.points()[intersection.index];
					if (core_point) {
						return core_point.stringAttribValue(attribute_name);
					}
					return;
				}
			}
			TypeAssert.unreachable(attrib_type);
		}
	}

	private _found_position_target_param: Vector3Param | undefined;
	private _hit_position_array: Number3 = [0, 0, 0];
	private _set_position_param(hit_position: Vector3) {
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
