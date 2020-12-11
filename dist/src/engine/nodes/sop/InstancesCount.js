import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {InstancedBufferGeometry as InstancedBufferGeometry2} from "three/src/core/InstancedBufferGeometry";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class InstancesCountSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.use_max = ParamConfig.BOOLEAN(0);
    this.max = ParamConfig.INTEGER(1, {
      range: [0, 100],
      range_locked: [true, false],
      visible_if: {use_max: 1}
    });
  }
}
const ParamsConfig2 = new InstancesCountSopParamsConfig();
export class InstancesCountSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "instances_count";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  async cook(input_contents) {
    const core_group = input_contents[0];
    const objects = core_group.objects_with_geo();
    for (let object of objects) {
      const geometry = object.geometry;
      if (geometry) {
        if (geometry instanceof InstancedBufferGeometry2) {
          if (this.pv.use_max) {
            geometry.instanceCount = this.pv.max;
          } else {
            geometry.instanceCount = Infinity;
          }
        }
      }
    }
    this.set_core_group(core_group);
  }
}
