import {BaseSopOperation} from "./_Base";
import {SphereBufferGeometry as SphereBufferGeometry2} from "three/src/geometries/SphereBufferGeometry";
import {IcosahedronBufferGeometry as IcosahedronBufferGeometry2} from "three/src/geometries/IcosahedronBufferGeometry";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
var SphereType;
(function(SphereType2) {
  SphereType2["DEFAULT"] = "default";
  SphereType2["ISOCAHEDRON"] = "isocahedron";
})(SphereType || (SphereType = {}));
export const SPHERE_TYPE = {
  default: 0,
  isocahedron: 1
};
export const SPHERE_TYPES = [SphereType.DEFAULT, SphereType.ISOCAHEDRON];
export class SphereSopOperation extends BaseSopOperation {
  static type() {
    return "sphere";
  }
  cook(input_contents, params) {
    const core_group = input_contents[0];
    if (core_group) {
      return this._cook_with_input(core_group, params);
    } else {
      return this._cook_without_input(params);
    }
  }
  _cook_without_input(params) {
    const geometry = this._create_required_geometry(params);
    geometry.translate(params.center.x, params.center.y, params.center.z);
    return this.create_core_group_from_geometry(geometry);
  }
  _cook_with_input(core_group, params) {
    const bbox = core_group.bounding_box();
    const size = bbox.max.clone().sub(bbox.min);
    const center = bbox.max.clone().add(bbox.min).multiplyScalar(0.5);
    const geometry = this._create_required_geometry(params);
    geometry.translate(params.center.x, params.center.y, params.center.z);
    geometry.translate(center.x, center.y, center.z);
    geometry.scale(size.x, size.y, size.z);
    return this.create_core_group_from_geometry(geometry);
  }
  _create_required_geometry(params) {
    if (params.type == SPHERE_TYPE.default) {
      return this._create_default_sphere(params);
    } else {
      return this._create_default_isocahedron(params);
    }
  }
  _create_default_sphere(params) {
    if (params.open) {
      return new SphereBufferGeometry2(params.radius, params.resolution.x, params.resolution.y, params.angle_range_x.x, params.angle_range_x.y, params.angle_range_y.x, params.angle_range_y.y);
    } else {
      return new SphereBufferGeometry2(params.radius, params.resolution.x, params.resolution.y);
    }
  }
  _create_default_isocahedron(params) {
    return new IcosahedronBufferGeometry2(params.radius, params.detail);
  }
}
SphereSopOperation.DEFAULT_PARAMS = {
  type: SPHERE_TYPE.default,
  radius: 1,
  resolution: new Vector22(30, 30),
  open: false,
  angle_range_x: new Vector22(0, Math.PI * 2),
  angle_range_y: new Vector22(0, Math.PI),
  detail: 1,
  center: new Vector32(0, 0, 0)
};
SphereSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
