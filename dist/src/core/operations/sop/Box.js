import {BaseSopOperation} from "./_Base";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {CoreTransform} from "../../Transform";
import {BoxBufferGeometry as BoxBufferGeometry2} from "three/src/geometries/BoxBufferGeometry";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export class BoxSopOperation extends BaseSopOperation {
  constructor() {
    super(...arguments);
    this._core_transform = new CoreTransform();
  }
  static type() {
    return "box";
  }
  cook(input_contents, params) {
    const input_core_group = input_contents[0];
    const geometry = input_core_group ? this._cook_with_input(input_core_group, params) : this._cook_without_input(params);
    return this.create_core_group_from_geometry(geometry);
  }
  _cook_without_input(params) {
    const divisions = params.divisions;
    const size = params.size;
    const geometry = new BoxBufferGeometry2(size, size, size, divisions, divisions, divisions);
    geometry.translate(params.center.x, params.center.y, params.center.z);
    geometry.computeVertexNormals();
    return geometry;
  }
  _cook_with_input(core_group, params) {
    const divisions = params.divisions;
    const bbox = core_group.bounding_box();
    const size = bbox.max.clone().sub(bbox.min);
    const center = bbox.max.clone().add(bbox.min).multiplyScalar(0.5);
    const geometry = new BoxBufferGeometry2(size.x, size.y, size.z, divisions, divisions, divisions);
    const matrix = this._core_transform.translation_matrix(center);
    geometry.applyMatrix4(matrix);
    return geometry;
  }
}
BoxSopOperation.DEFAULT_PARAMS = {
  size: 1,
  divisions: 1,
  center: new Vector32(0, 0, 0)
};
BoxSopOperation.INPUT_CLONED_STATE = InputCloneMode2.NEVER;
