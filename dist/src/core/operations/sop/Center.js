import {BaseSopOperation} from "./_Base";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {ObjectType} from "../../geometry/Constant";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
import {BufferAttribute as BufferAttribute2} from "three/src/core/BufferAttribute";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
export class CenterSopOperation extends BaseSopOperation {
  constructor() {
    super(...arguments);
    this._geo_center = new Vector32();
  }
  static type() {
    return "center";
  }
  cook(input_contents, params) {
    const core_group = input_contents[0];
    const src_object = core_group.objects_with_geo()[0];
    const new_object = this._create_object(src_object);
    if (new_object) {
      return this.create_core_group_from_objects([new_object]);
    } else {
      return this.create_core_group_from_objects([]);
    }
  }
  _create_object(src_object) {
    const src_geometry = src_object.geometry;
    src_geometry.computeBoundingBox();
    if (src_geometry.boundingBox) {
      src_geometry.boundingBox?.getCenter(this._geo_center);
      src_object.updateMatrixWorld();
      this._geo_center.applyMatrix4(src_object.matrixWorld);
      const geometry = new BufferGeometry2();
      const positions = this._geo_center.toArray();
      geometry.setAttribute("position", new BufferAttribute2(new Float32Array(positions), 3));
      return this.create_object(geometry, ObjectType.POINTS);
    }
  }
}
CenterSopOperation.DEFAULT_PARAMS = {};
CenterSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
