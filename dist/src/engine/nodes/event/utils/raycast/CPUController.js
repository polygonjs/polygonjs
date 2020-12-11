import lodash_isString from "lodash/isString";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Raycaster as Raycaster2} from "three/src/core/Raycaster";
import {NodeContext as NodeContext2} from "../../../../poly/NodeContext";
import {TypeAssert} from "../../../../poly/Assert";
import {Plane as Plane2} from "three/src/math/Plane";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {ParamType as ParamType2} from "../../../../poly/ParamType";
import {AttribType, ATTRIBUTE_TYPES} from "../../../../../core/geometry/Constant";
import {object_type_from_constructor, ObjectType} from "../../../../../core/geometry/Constant";
import {CoreGeometry} from "../../../../../core/geometry/Geometry";
import {Triangle as Triangle2} from "three/src/math/Triangle";
import {Poly as Poly2} from "../../../../Poly";
import {RaycastCPUVelocityController} from "./VelocityController";
export var CPUIntersectWith;
(function(CPUIntersectWith2) {
  CPUIntersectWith2["GEOMETRY"] = "geometry";
  CPUIntersectWith2["PLANE"] = "plane";
})(CPUIntersectWith || (CPUIntersectWith = {}));
export const CPU_INTERSECT_WITH_OPTIONS = [CPUIntersectWith.GEOMETRY, CPUIntersectWith.PLANE];
const RaycastCPUController2 = class {
  constructor(_node) {
    this._node = _node;
    this._mouse = new Vector22();
    this._mouse_array = [0, 0];
    this._raycaster = new Raycaster2();
    this._plane = new Plane2();
    this._plane_intersect_target = new Vector32();
    this._hit_position_array = [0, 0, 0];
    this.velocity_controller = new RaycastCPUVelocityController(this._node);
  }
  update_mouse(context) {
    if (!(context.canvas && context.camera_node)) {
      return;
    }
    if (context.event instanceof MouseEvent) {
      this._mouse.x = context.event.offsetX / context.canvas.offsetWidth * 2 - 1;
      this._mouse.y = -(context.event.offsetY / context.canvas.offsetHeight) * 2 + 1;
      this._mouse.toArray(this._mouse_array);
      this._node.p.mouse.set(this._mouse_array);
    }
    this._raycaster.setFromCamera(this._mouse, context.camera_node.object);
  }
  process_event(context) {
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
  _intersect_with_plane(context) {
    this._plane.normal.copy(this._node.pv.plane_direction);
    this._plane.constant = this._node.pv.plane_offset;
    this._raycaster.ray.intersectPlane(this._plane, this._plane_intersect_target);
    this._set_position_param(this._plane_intersect_target);
    this._node.trigger_hit(context);
  }
  _intersect_with_geometry(context) {
    if (!this._resolved_target) {
      this.update_target();
    }
    if (this._resolved_target) {
      const intersections = this._raycaster.intersectObject(this._resolved_target, true);
      const intersection = intersections[0];
      if (intersection) {
        this._set_position_param(intersection.point);
        if (this._node.pv.geo_attribute == true) {
          this._resolve_geometry_attribute(intersection);
        }
        context.value = {intersect: intersection};
        this._node.trigger_hit(context);
      } else {
        this._node.trigger_miss(context);
      }
    }
  }
  _resolve_geometry_attribute(intersection) {
    const attrib_type = ATTRIBUTE_TYPES[this._node.pv.geo_attribute_type];
    const val = RaycastCPUController2.resolve_geometry_attribute(intersection, this._node.pv.geo_attribute_name, attrib_type);
    if (val != null) {
      switch (attrib_type) {
        case AttribType.NUMERIC: {
          this._node.p.geo_attribute_value1.set(val);
          return;
        }
        case AttribType.STRING: {
          if (lodash_isString(val)) {
            this._node.p.geo_attribute_values.set(val);
          }
          return;
        }
      }
      TypeAssert.unreachable(attrib_type);
    }
  }
  static resolve_geometry_attribute(intersection, attribute_name, attrib_type) {
    const object_type = object_type_from_constructor(intersection.object.constructor);
    switch (object_type) {
      case ObjectType.MESH:
        return this.resolve_geometry_attribute_for_mesh(intersection, attribute_name, attrib_type);
      case ObjectType.POINTS:
        return this.resolve_geometry_attribute_for_point(intersection, attribute_name, attrib_type);
    }
  }
  static resolve_geometry_attribute_for_mesh(intersection, attribute_name, attrib_type) {
    const geometry = intersection.object.geometry;
    if (geometry) {
      const attribute = geometry.getAttribute(attribute_name);
      if (attribute) {
        switch (attrib_type) {
          case AttribType.NUMERIC: {
            const position = geometry.getAttribute("position");
            if (intersection.face) {
              this._vA.fromBufferAttribute(position, intersection.face.a);
              this._vB.fromBufferAttribute(position, intersection.face.b);
              this._vC.fromBufferAttribute(position, intersection.face.c);
              this._uvA.fromBufferAttribute(attribute, intersection.face.a);
              this._uvB.fromBufferAttribute(attribute, intersection.face.b);
              this._uvC.fromBufferAttribute(attribute, intersection.face.c);
              intersection.uv = Triangle2.getUV(intersection.point, this._vA, this._vB, this._vC, this._uvA, this._uvB, this._uvC, this._hitUV);
              return this._hitUV.x;
            }
            return;
          }
          case AttribType.STRING: {
            const core_geometry = new CoreGeometry(geometry);
            const core_point = core_geometry.points()[0];
            if (core_point) {
              return core_point.string_attrib_value(attribute_name);
            }
            return;
          }
        }
        TypeAssert.unreachable(attrib_type);
      }
    }
  }
  static resolve_geometry_attribute_for_point(intersection, attribute_name, attrib_type) {
    const geometry = intersection.object.geometry;
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
            return core_point.string_attrib_value(attribute_name);
          }
          return;
        }
      }
      TypeAssert.unreachable(attrib_type);
    }
  }
  _set_position_param(hit_position) {
    hit_position.toArray(this._hit_position_array);
    if (this._node.pv.tposition_target) {
      if (Poly2.instance().player_mode()) {
        this._found_position_target_param = this._found_position_target_param || this._node.p.position_target.found_param_with_type(ParamType2.VECTOR3);
      } else {
        const target_param = this._node.p.position_target;
        this._found_position_target_param = target_param.found_param_with_type(ParamType2.VECTOR3);
      }
      if (this._found_position_target_param) {
        this._found_position_target_param.set(this._hit_position_array);
      }
    } else {
      this._node.p.position.set(this._hit_position_array);
    }
    this.velocity_controller.process(hit_position);
  }
  _prepare_raycaster(context) {
    const points_param = this._raycaster.params.Points;
    if (points_param) {
      points_param.threshold = this._node.pv.points_threshold;
    }
    let camera_node = context.camera_node;
    if (this._node.pv.override_camera) {
      if (this._node.pv.override_ray) {
        this._raycaster.ray.origin.copy(this._node.pv.ray_origin);
        this._raycaster.ray.direction.copy(this._node.pv.ray_direction);
      } else {
        const found_camera_node = this._node.p.camera.found_node_with_context(NodeContext2.OBJ);
        if (found_camera_node) {
          camera_node = found_camera_node;
        }
      }
    }
    if (camera_node && !this._node.pv.override_ray) {
      if (camera_node) {
        camera_node.prepare_raycaster(this._mouse, this._raycaster);
      }
    }
  }
  update_target() {
    const node = this._node.p.target.found_node();
    if (node) {
      if (node.node_context() == NodeContext2.OBJ) {
        this._resolved_target = this._node.pv.traverse_children ? node.object : node.children_display_controller.sop_group;
      } else {
        this._node.states.error.set("target is not an obj");
      }
    } else {
      this._node.states.error.set("no target found");
    }
  }
  async update_position_target() {
    if (this._node.p.position_target.is_dirty) {
      await this._node.p.position_target.compute();
    }
  }
  static PARAM_CALLBACK_update_target(node) {
    node.cpu_controller.update_target();
  }
};
export let RaycastCPUController = RaycastCPUController2;
RaycastCPUController._vA = new Vector32();
RaycastCPUController._vB = new Vector32();
RaycastCPUController._vC = new Vector32();
RaycastCPUController._uvA = new Vector22();
RaycastCPUController._uvB = new Vector22();
RaycastCPUController._uvC = new Vector22();
RaycastCPUController._hitUV = new Vector22();
