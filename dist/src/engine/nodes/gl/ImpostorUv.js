import Quaternion from "./gl/quaternion.glsl";
import Impostor from "./gl/impostor.glsl";
import {TypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../../src/core/ThreeToGl";
import {ParamConfig, NodeParamsConfig} from "../utils/params/ParamsConfig";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
import {FunctionGLDefinition} from "./utils/GLDefinition";
const OUTPUT_NAME = "uv";
class ImpostorUvGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.center = ParamConfig.VECTOR3([0, 0, 0]);
    this.camera_pos = ParamConfig.VECTOR3([0, 0, 0]);
    this.uv = ParamConfig.VECTOR2([0, 0]);
    this.tiles_count = ParamConfig.INTEGER(8, {
      range: [0, 32],
      range_locked: [true, false]
    });
    this.offset = ParamConfig.FLOAT(0);
  }
}
const ParamsConfig2 = new ImpostorUvGlParamsConfig();
export class ImpostorUvGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "impostor_uv";
  }
  initialize_node() {
    super.initialize_node();
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC2)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const body_lines = [];
    shaders_collection_controller.add_definitions(this, [
      new FunctionGLDefinition(this, Quaternion),
      new FunctionGLDefinition(this, Impostor)
    ]);
    const center = ThreeToGl2.vector3(this.variable_for_input(this.p.center.name));
    const camera_pos = ThreeToGl2.vector3(this.variable_for_input(this.p.camera_pos.name));
    const uv = ThreeToGl2.vector2(this.variable_for_input(this.p.uv.name));
    const tiles_count = ThreeToGl2.float(this.variable_for_input(this.p.tiles_count.name));
    const offset = ThreeToGl2.float(this.variable_for_input(this.p.offset.name));
    const impostor_uv = this.gl_var_name(OUTPUT_NAME);
    const args = [center, camera_pos, uv, tiles_count, offset].join(", ");
    body_lines.push(`vec2 ${impostor_uv} = impostor_uv(${args})`);
    shaders_collection_controller.add_body_lines(this, body_lines);
  }
}
