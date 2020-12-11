import {TypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
import QuaternionMethods from "./gl/quaternion.glsl";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
import {FunctionGLDefinition} from "./utils/GLDefinition";
const VARS = {
  position: "position",
  normal: "normal",
  instance_position: "instancePosition",
  instance_orientation: "instanceOrientation",
  instance_scale: "instanceScale"
};
class InstanceTransformGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.position = ParamConfig.VECTOR3([0, 0, 0]);
    this.normal = ParamConfig.VECTOR3([0, 0, 1]);
    this.instance_position = ParamConfig.VECTOR3([0, 0, 0]);
    this.instance_orientation = ParamConfig.VECTOR4([0, 0, 0, 0]);
    this.instance_scale = ParamConfig.VECTOR3([1, 1, 1]);
  }
}
const ParamsConfig2 = new InstanceTransformGlParamsConfig();
export class InstanceTransformGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "instance_transform";
  }
  initialize_node() {
    super.initialize_node();
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(this.gl_output_name_position(), GlConnectionPointType.VEC3),
      new GlConnectionPoint(this.gl_output_name_normal(), GlConnectionPointType.VEC3)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const body_lines = [];
    const function_declaration_lines = [];
    function_declaration_lines.push(new FunctionGLDefinition(this, QuaternionMethods));
    const input_position = this.io.inputs.named_input(this.p.position.name);
    const position = input_position ? ThreeToGl2.float(this.variable_for_input(this.p.position.name)) : this._default_position();
    const input_normal = this.io.inputs.named_input(this.p.normal.name);
    const normal = input_normal ? ThreeToGl2.float(this.variable_for_input(this.p.normal.name)) : this._default_normal();
    const input_instancePosition = this.io.inputs.named_input(this.p.instance_position.name);
    const instancePosition = input_instancePosition ? ThreeToGl2.float(this.variable_for_input(this.p.instance_position.name)) : this._default_instance_position(shaders_collection_controller);
    const input_instanceOrientation = this.io.inputs.named_input(this.p.instance_orientation.name);
    const instanceOrientation = input_instanceOrientation ? ThreeToGl2.float(this.variable_for_input(this.p.instance_orientation.name)) : this._default_input_instance_orientation(shaders_collection_controller);
    const input_instanceScale = this.io.inputs.named_input(this.p.instance_scale.name);
    const instanceScale = input_instanceScale ? ThreeToGl2.float(this.variable_for_input(this.p.instance_scale.name)) : this._default_input_instance_scale(shaders_collection_controller);
    const result_position = this.gl_var_name(this.gl_output_name_position());
    const result_normal = this.gl_var_name(this.gl_output_name_normal());
    body_lines.push(`vec3 ${result_position} = vec3(${position})`);
    body_lines.push(`${result_position} *= ${instanceScale}`);
    body_lines.push(`${result_position} = rotate_with_quat( ${result_position}, ${instanceOrientation} )`);
    body_lines.push(`${result_position} += ${instancePosition}`);
    body_lines.push(`vec3 ${result_normal} = vec3(${normal})`);
    body_lines.push(`${result_normal} = rotate_with_quat( ${result_normal}, ${instanceOrientation} )`);
    shaders_collection_controller.add_body_lines(this, body_lines);
    shaders_collection_controller.add_definitions(this, function_declaration_lines);
  }
  gl_output_name_position() {
    return "position";
  }
  gl_output_name_normal() {
    return "normal";
  }
  _default_position() {
    return VARS.position;
  }
  _default_normal() {
    return VARS.normal;
  }
  _default_instance_position(shaders_collection_controller) {
    return this.material_node?.assembler_controller?.assembler.globals_handler?.read_attribute(this, GlConnectionPointType.VEC3, VARS.instance_position, shaders_collection_controller);
  }
  _default_input_instance_orientation(shaders_collection_controller) {
    return this.material_node?.assembler_controller?.assembler.globals_handler?.read_attribute(this, GlConnectionPointType.VEC4, VARS.instance_orientation, shaders_collection_controller);
  }
  _default_input_instance_scale(shaders_collection_controller) {
    return this.material_node?.assembler_controller?.assembler.globals_handler?.read_attribute(this, GlConnectionPointType.VEC3, VARS.instance_scale, shaders_collection_controller);
  }
}
