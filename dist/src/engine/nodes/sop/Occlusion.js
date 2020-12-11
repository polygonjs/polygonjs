import geoao from "geo-ambient-occlusion";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class OcclusionSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.attrib_name = ParamConfig.STRING("occlusion");
    this.samples = ParamConfig.INTEGER(256, {
      range: [1, 256],
      range_locked: [true, false]
    });
    this.sep = ParamConfig.SEPARATOR();
    this.buffer_resolution = ParamConfig.INTEGER(512);
    this.bias = ParamConfig.FLOAT(0.01);
  }
}
const ParamsConfig2 = new OcclusionSopParamsConfig();
export class OcclusionSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "occlusion";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  async cook(input_contents) {
    const core_group = input_contents[0];
    const core_objects = core_group.core_objects();
    for (let core_object of core_objects) {
      await this._process_occlusion_on_object(core_object);
    }
    this.set_core_group(core_group);
  }
  async _process_occlusion_on_object(core_object) {
    const geometry = core_object.core_geometry()?.geometry();
    if (!geometry) {
      return;
    }
    const position_array = geometry.attributes.position.array;
    const normal_array = geometry.attributes.normal.array;
    const index_array = geometry.getIndex()?.array;
    const aoSampler = geoao(position_array, {
      cells: index_array,
      normals: normal_array,
      resolution: this.pv.buffer_resolution,
      bias: this.pv.bias
    });
    for (let i = 0; i < this.pv.samples; i++) {
      aoSampler.sample();
    }
    const ao = aoSampler.report();
    geometry.setAttribute(this.pv.attrib_name, new Float32BufferAttribute(ao, 1));
    aoSampler.dispose();
  }
}
