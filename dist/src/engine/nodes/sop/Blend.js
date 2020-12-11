import {TypedSopNode} from "./_Base";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
class BlendSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.attrib_name = ParamConfig.STRING();
    this.blend = ParamConfig.FLOAT(0.5, {
      range: [0, 1],
      range_locked: [true, true]
    });
  }
}
const ParamsConfig2 = new BlendSopParamsConfig();
export class BlendSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "blend";
  }
  static displayed_input_names() {
    return ["geometry to blend from", "geometry to blend to"];
  }
  initialize_node() {
    this.io.inputs.set_count(2);
    this.io.inputs.init_inputs_cloned_state([InputCloneMode2.FROM_NODE, InputCloneMode2.NEVER]);
  }
  cook(input_contents) {
    const core_group0 = input_contents[0];
    const core_group1 = input_contents[1];
    const objects0 = core_group0.objects();
    const objects1 = core_group1.objects();
    let object0, object1;
    for (let i = 0; i < objects0.length; i++) {
      object0 = objects0[i];
      object1 = objects1[i];
      this.blend(object0, object1, this.pv.blend);
    }
    this.set_core_group(core_group0);
  }
  blend(object0, object1, blend) {
    const geometry0 = object0.geometry;
    const geometry1 = object1.geometry;
    if (geometry0 == null || geometry1 == null) {
      return;
    }
    const attrib0 = geometry0.getAttribute(this.pv.attrib_name);
    const attrib1 = geometry1.getAttribute(this.pv.attrib_name);
    if (attrib0 == null || attrib1 == null) {
      return;
    }
    const attrib0_array = attrib0.array;
    const attrib1_array = attrib1.array;
    let c0, c1;
    for (let i = 0; i < attrib0_array.length; i++) {
      c0 = attrib0_array[i];
      c1 = attrib1_array[i];
      if (c1 != null) {
        attrib0_array[i] = (1 - blend) * c0 + blend * c1;
      }
    }
    geometry0.computeVertexNormals();
  }
}
