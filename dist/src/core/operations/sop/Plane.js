import {BaseSopOperation} from "./_Base";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {PlaneBufferGeometry as PlaneBufferGeometry2} from "three/src/geometries/PlaneBufferGeometry";
import {CoreTransform} from "../../../core/Transform";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
const DEFAULT_UP = new Vector32(0, 0, 1);
const ROTATE_START = new Vector32(0, 0, 1);
const ROTATE_END = new Vector32(0, 1, 0);
export class PlaneSopOperation extends BaseSopOperation {
  constructor() {
    super(...arguments);
    this._core_transform = new CoreTransform();
  }
  static type() {
    return "plane";
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
    const geometry = this._create_plane(params.size, params);
    this._core_transform.rotate_geometry(geometry, DEFAULT_UP, params.direction);
    const matrix = this._core_transform.translation_matrix(params.center);
    geometry.applyMatrix4(matrix);
    return this.create_core_group_from_geometry(geometry);
  }
  _cook_with_input(core_group, params) {
    const bbox = core_group.bounding_box();
    const size = new Vector32();
    bbox.getSize(size);
    const center = new Vector32();
    bbox.getCenter(center);
    const size2d = new Vector22(size.x, size.z);
    const geometry = this._create_plane(size2d, params);
    this._core_transform.rotate_geometry(geometry, ROTATE_START, ROTATE_END);
    const matrix = this._core_transform.translation_matrix(center);
    geometry.applyMatrix4(matrix);
    return this.create_core_group_from_geometry(geometry);
  }
  _create_plane(size, params) {
    let segments_count = new Vector22(1, 1);
    size = size.clone();
    if (params.use_segments_count) {
      segments_count.x = Math.floor(params.segments.x);
      segments_count.y = Math.floor(params.segments.y);
    } else {
      if (params.step_size > 0) {
        segments_count.x = Math.floor(size.x / params.step_size);
        segments_count.y = Math.floor(size.y / params.step_size);
        size.x = segments_count.x * params.step_size;
        size.y = segments_count.y * params.step_size;
      }
    }
    return new PlaneBufferGeometry2(size.x, size.y, segments_count.x, segments_count.y);
  }
}
PlaneSopOperation.DEFAULT_PARAMS = {
  size: new Vector22(1, 1),
  use_segments_count: false,
  step_size: 1,
  segments: new Vector22(1, 1),
  direction: new Vector32(0, 1, 0),
  center: new Vector32(0, 0, 0)
};
PlaneSopOperation.INPUT_CLONED_STATE = InputCloneMode2.NEVER;
