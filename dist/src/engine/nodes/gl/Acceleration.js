import {TypedGlNode} from "./_Base";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
import {UniformGLDefinition, FunctionGLDefinition} from "./utils/GLDefinition";
import {GlConstant as GlConstant2} from "../../../core/geometry/GlConstant";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
import Physics from "./gl/physics.glsl";
var AccelerationGlInput;
(function(AccelerationGlInput2) {
  AccelerationGlInput2["POSITION"] = "position";
  AccelerationGlInput2["VELOCITY"] = "velocity";
  AccelerationGlInput2["MASS"] = "mass";
  AccelerationGlInput2["FORCE"] = "force";
})(AccelerationGlInput || (AccelerationGlInput = {}));
var AccelerationGlOutput;
(function(AccelerationGlOutput2) {
  AccelerationGlOutput2["POSITION"] = "position";
  AccelerationGlOutput2["VELOCITY"] = "velocity";
})(AccelerationGlOutput || (AccelerationGlOutput = {}));
const INPUT_NAMES = [
  AccelerationGlInput.POSITION,
  AccelerationGlInput.VELOCITY,
  AccelerationGlInput.MASS,
  AccelerationGlInput.FORCE
];
const OUTPUT_NAMES = [AccelerationGlOutput.POSITION, AccelerationGlOutput.VELOCITY];
const INPUT_DEFAULT_VALUE = {
  [AccelerationGlInput.POSITION]: [0, 0, 0],
  [AccelerationGlInput.VELOCITY]: [0, 0, 0],
  [AccelerationGlInput.MASS]: 1,
  [AccelerationGlInput.FORCE]: [0, -9.8, 0]
};
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class AccelerationGlParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new AccelerationGlParamsConfig();
export class AccelerationGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "acceleration";
  }
  initialize_node() {
    super.initialize_node();
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(AccelerationGlOutput.POSITION, GlConnectionPointType.VEC3),
      new GlConnectionPoint(AccelerationGlOutput.VELOCITY, GlConnectionPointType.VEC3)
    ]);
    this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
    this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
    this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
    this.io.connection_points.set_output_name_function(this._gl_output_name.bind(this));
  }
  _expected_input_types() {
    const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.VEC3;
    return [type, type, GlConnectionPointType.FLOAT, type];
  }
  _expected_output_types() {
    const in_type = this._expected_input_types()[0];
    return [in_type, in_type];
  }
  _gl_input_name(index) {
    return INPUT_NAMES[index];
  }
  _gl_output_name(index) {
    return OUTPUT_NAMES[index];
  }
  param_default_value(name) {
    return INPUT_DEFAULT_VALUE[name];
  }
  set_lines(shaders_collection_controller) {
    const var_type = this.io.outputs.named_output_connection_points[0].type;
    const delta_definition = new UniformGLDefinition(this, GlConnectionPointType.FLOAT, GlConstant2.DELTA_TIME);
    const function_definition = new FunctionGLDefinition(this, Physics);
    shaders_collection_controller.add_definitions(this, [delta_definition, function_definition]);
    const input_position = ThreeToGl2.any(this.variable_for_input(AccelerationGlInput.POSITION));
    const input_velocity = ThreeToGl2.any(this.variable_for_input(AccelerationGlInput.VELOCITY));
    const input_mass = ThreeToGl2.float(this.variable_for_input(AccelerationGlInput.MASS));
    const input_force = ThreeToGl2.any(this.variable_for_input(AccelerationGlInput.FORCE));
    const position_result = this.gl_var_name(AccelerationGlOutput.POSITION);
    const velocity_result = this.gl_var_name(AccelerationGlOutput.VELOCITY);
    const velocity_args = [input_velocity, input_force, input_mass, GlConstant2.DELTA_TIME].join(", ");
    const velocity_body_line = `${var_type} ${velocity_result} = compute_velocity_from_acceleration(${velocity_args})`;
    const position_args = [input_position, velocity_result, GlConstant2.DELTA_TIME].join(", ");
    const position_body_line = `${var_type} ${position_result} = compute_position_from_velocity(${position_args})`;
    shaders_collection_controller.add_body_lines(this, [velocity_body_line, position_body_line]);
  }
}
