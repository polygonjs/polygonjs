import {BaseSopOperation} from "./_Base";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {CoreTransform} from "../../Transform";
import {RoundedBoxBufferGeometry as RoundedBoxBufferGeometry2} from "../../../modules/three/examples/jsm/geometries/RoundedBoxBufferGeometry";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export class RoundedBoxSopOperation extends BaseSopOperation {
  constructor() {
    super(...arguments);
    this._core_transform = new CoreTransform();
  }
  static type() {
    return "rounded_box";
  }
  cook(input_contents, params) {
    const input_core_group = input_contents[0];
    const geometry = input_core_group ? this._cook_with_input(input_core_group, params) : this._cook_without_input(params);
    return this.create_core_group_from_geometry(geometry);
  }
  _cook_without_input(params) {
    const size = params.size;
    const geometry = new RoundedBoxBufferGeometry2(size, size, size, params.divisions, params.bevel);
    geometry.translate(params.center.x, params.center.y, params.center.z);
    geometry.computeVertexNormals();
    return geometry;
  }
  _cook_with_input(core_group, params) {
    const divisions = params.divisions;
    const bbox = core_group.bounding_box();
    const size = bbox.max.clone().sub(bbox.min);
    const center = bbox.max.clone().add(bbox.min).multiplyScalar(0.5);
    const geometry = new RoundedBoxBufferGeometry2(size.x, size.y, size.z, divisions, params.bevel);
    const matrix = this._core_transform.translation_matrix(center);
    geometry.applyMatrix4(matrix);
    return geometry;
  }
}
RoundedBoxSopOperation.DEFAULT_PARAMS = {
  size: 1,
  divisions: 2,
  bevel: 0.1,
  center: new Vector32(0, 0, 0)
};
RoundedBoxSopOperation.INPUT_CLONED_STATE = InputCloneMode2.NEVER;
