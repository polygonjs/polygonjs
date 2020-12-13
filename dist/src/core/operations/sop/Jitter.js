import {BaseSopOperation} from "./_Base";
import {CoreMath} from "../../math/_Module";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export class JitterSopOperation extends BaseSopOperation {
  static type() {
    return "jitter";
  }
  cook(input_contents, params) {
    const core_group = input_contents[0];
    const points = core_group.points();
    let point;
    for (let i = 0; i < points.length; i++) {
      point = points[i];
      const offset = new Vector32(2 * params.mult.x * (CoreMath.rand_float(i * 75 + 764 + params.seed) - 0.5), 2 * params.mult.y * (CoreMath.rand_float(i * 5678 + 3653 + params.seed) - 0.5), 2 * params.mult.z * (CoreMath.rand_float(i * 657 + 48464 + params.seed) - 0.5));
      offset.normalize();
      offset.multiplyScalar(params.amount * CoreMath.rand_float(i * 78 + 54 + params.seed));
      const new_position = point.position().clone().add(offset);
      point.set_position(new_position);
    }
    return core_group;
  }
}
JitterSopOperation.DEFAULT_PARAMS = {
  amount: 1,
  mult: new Vector32(1, 1, 1),
  seed: 1
};
JitterSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
