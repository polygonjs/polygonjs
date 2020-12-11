import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Raycaster as Raycaster2} from "three/src/core/Raycaster";
import {Plane as Plane2} from "three/src/math/Plane";
import {Vector2 as Vector22} from "three/src/math/Vector2";
export class RayHelper {
  constructor(event_helper, default_scene, _point_threshold_mult = 1) {
    this.event_helper = event_helper;
    this.default_scene = default_scene;
    this._point_threshold_mult = _point_threshold_mult;
    this.raycaster = new Raycaster2();
    this.world_plane = new Plane2(new Vector32(0, 0, 1));
    this._ignore_list = {};
    this._mouse = new Vector22();
  }
  point_threshold() {
    return this.raycaster.params?.Points?.threshold;
  }
  point_threshold_mult() {
    return this._point_threshold_mult;
  }
  set_point_threshold(point_threshold) {
    if (this.raycaster.params.Points) {
      this.raycaster.params.Points.threshold = point_threshold;
    }
  }
  ignore(mesh) {
    return this._ignore_list[mesh.uuid] = mesh;
  }
  mouse() {
    return this._mouse;
  }
  intersects_from_event(event, camera, objects) {
    this.event_helper.normalized_position(event, this._mouse);
    this.raycaster.setFromCamera(this._mouse, camera);
    if (objects == null) {
      objects = this.default_scene.children;
    }
    let intersects = this.raycaster.intersectObjects(objects, true);
    const ignored_uuids = Object.keys(this._ignore_list);
    intersects = intersects.filter((intersect) => {
      return !ignored_uuids.includes(intersect.object.uuid);
    });
    return intersects;
  }
  intersect_plane_from_event(event, camera, plane) {
    this.event_helper.normalized_position(event, this._mouse);
    return this.intersect_plane(this._mouse, camera, plane);
  }
  intersect_plane(mouse, camera, plane) {
    this.raycaster.setFromCamera(mouse, camera);
    const point = new Vector32();
    this.raycaster.ray.intersectPlane(plane, point);
    return point;
  }
  intersect_world_plane(camera) {
    this.raycaster.setFromCamera(this._mouse, camera);
    const point = new Vector32();
    this.raycaster.ray.intersectPlane(this.world_plane, point);
    return point;
  }
}
