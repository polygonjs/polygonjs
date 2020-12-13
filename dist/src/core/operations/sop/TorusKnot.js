import {BaseSopOperation} from "./_Base";
import {TorusKnotBufferGeometry as TorusKnotBufferGeometry2} from "three/src/geometries/TorusKnotBufferGeometry";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export class TorusKnotSopOperation extends BaseSopOperation {
  static type() {
    return "torus_knot";
  }
  cook(input_contents, params) {
    const radius = params.radius;
    const radius_tube = params.radius_tube;
    const segments_radial = params.segments_radial;
    const segments_tube = params.segments_tube;
    const p = params.p;
    const q = params.q;
    const geometry = new TorusKnotBufferGeometry2(radius, radius_tube, segments_radial, segments_tube, p, q);
    geometry.translate(params.center.x, params.center.y, params.center.z);
    return this.create_core_group_from_geometry(geometry);
  }
}
TorusKnotSopOperation.DEFAULT_PARAMS = {
  radius: 1,
  radius_tube: 1,
  segments_radial: 64,
  segments_tube: 8,
  p: 2,
  q: 3,
  center: new Vector32(0, 0, 0)
};
TorusKnotSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
