import {BaseSopOperation} from "./_Base";
import {CoreGeometry} from "../../geometry/Geometry";
const POSITION = "position";
export class PeakSopOperation extends BaseSopOperation {
  static type() {
    return "peak";
  }
  cook(input_contents, params) {
    const core_group = input_contents[0];
    let core_geometry, point;
    for (let object of core_group.objects()) {
      object.traverse((child_object) => {
        let geometry;
        if ((geometry = child_object.geometry) != null) {
          core_geometry = new CoreGeometry(geometry);
          for (point of core_geometry.points()) {
            const normal = point.normal();
            const position = point.position();
            const new_position = position.clone().add(normal.multiplyScalar(params.amount));
            point.set_position(new_position);
          }
          const attrib = core_geometry.geometry().getAttribute(POSITION);
          attrib.needsUpdate = true;
        }
      });
    }
    return input_contents[0];
  }
}
PeakSopOperation.DEFAULT_PARAMS = {
  amount: 1
};
