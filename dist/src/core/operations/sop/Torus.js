import {BaseSopOperation} from "./_Base";
import {TorusBufferGeometry as TorusBufferGeometry2} from "three/src/geometries/TorusBufferGeometry";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export class TorusSopOperation extends BaseSopOperation {
  static type() {
    return "torus";
  }
  cook(input_contents, params) {
    const radius = params.radius;
    const radius_tube = params.radius_tube;
    const segments_radial = params.segments_radial;
    const segments_tube = params.segments_tube;
    const geometry = new TorusBufferGeometry2(radius, radius_tube, segments_radial, segments_tube);
    geometry.translate(params.center.x, params.center.y, params.center.z);
    return this.create_core_group_from_geometry(geometry);
  }
}
TorusSopOperation.DEFAULT_PARAMS = {
  radius: 1,
  radius_tube: 1,
  segments_radial: 20,
  segments_tube: 12,
  center: new Vector32(0, 0, 0)
};
TorusSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
