import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {BufferAttribute as BufferAttribute2} from "three/src/core/BufferAttribute";
import {TypedSopNode} from "./_Base";
import {ObjectType} from "../../../core/geometry/Constant";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class BboxScatterSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.step_size = ParamConfig.FLOAT(0.1);
  }
}
const ParamsConfig2 = new BboxScatterSopParamsConfig();
export class BboxScatterSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "bbox_scatter";
  }
  static displayed_input_names() {
    return ["geometry to create points from"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
  }
  cook(input_contents) {
    const container = input_contents[0];
    const step_size = this.pv.step_size;
    const bbox = container.bounding_box();
    const min = bbox.min;
    const max = bbox.max;
    const positions = [];
    for (let x = min.x; x < max.x; x += step_size) {
      for (let y = min.x; y < max.y; y += step_size) {
        for (let z = min.x; z < max.z; z += step_size) {
          positions.push(x);
          positions.push(y);
          positions.push(z);
        }
      }
    }
    const geometry = new BufferGeometry2();
    geometry.setAttribute("position", new BufferAttribute2(new Float32Array(positions), 3));
    this.set_geometry(geometry, ObjectType.POINTS);
  }
}
