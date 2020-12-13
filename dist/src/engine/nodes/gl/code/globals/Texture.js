import {GlobalsBaseController} from "./_Base";
import {GlobalsGeometryHandler} from "./Geometry";
import {ShaderName as ShaderName2} from "../../../utils/shaders/ShaderName";
import {UniformGLDefinition, AttributeGLDefinition, VaryingGLDefinition} from "../../utils/GLDefinition";
import {GlConnectionPointType} from "../../../utils/io/connections/Gl";
const GlobalsTextureHandler2 = class extends GlobalsBaseController {
  constructor(_uv_name) {
    super();
    this._uv_name = _uv_name;
  }
  set_texture_allocations_controller(controller) {
    this._texture_allocations_controller = controller;
  }
  handle_globals_node(globals_node, output_name, shaders_collection_controller) {
    if (!this._texture_allocations_controller) {
      return;
    }
    const connection_point = globals_node.io.outputs.named_output_connection_points_by_name(output_name);
    const var_name = globals_node.gl_var_name(output_name);
    const variable = this._texture_allocations_controller.variable(output_name);
    if (variable && connection_point) {
      const gl_type = connection_point.type;
      const new_value = this.read_attribute(globals_node, gl_type, output_name, shaders_collection_controller);
      const body_line = `${gl_type} ${var_name} = ${new_value}`;
      shaders_collection_controller.add_body_lines(globals_node, [body_line]);
    } else {
      this.globals_geometry_handler = this.globals_geometry_handler || new GlobalsGeometryHandler();
      this.globals_geometry_handler.handle_globals_node(globals_node, output_name, shaders_collection_controller);
    }
  }
  read_attribute(node, gl_type, attrib_name, shaders_collection_controller) {
    if (!this._texture_allocations_controller) {
      return;
    }
    const texture_variable = this._texture_allocations_controller.variable(attrib_name);
    if (texture_variable) {
      this.add_particles_sim_uv_attribute(node, shaders_collection_controller);
      const component = texture_variable.component;
      const allocation = texture_variable.allocation;
      if (allocation) {
        const var_name_texture = allocation.texture_name;
        const texture_definition = new UniformGLDefinition(node, GlConnectionPointType.SAMPLER_2D, var_name_texture);
        shaders_collection_controller.add_definitions(node, [texture_definition]);
        const body_line = `texture2D( ${var_name_texture}, ${this._uv_name} ).${component}`;
        return body_line;
      }
    } else {
      return GlobalsGeometryHandler.read_attribute(node, gl_type, attrib_name, shaders_collection_controller);
    }
  }
  add_particles_sim_uv_attribute(node, shaders_collection_controller) {
    const particles_sim_uv_attrib_definition = new AttributeGLDefinition(node, GlConnectionPointType.VEC2, GlobalsTextureHandler2.UV_ATTRIB);
    const particles_sim_uv_varying_definition = new VaryingGLDefinition(node, GlConnectionPointType.VEC2, GlobalsTextureHandler2.UV_VARYING);
    shaders_collection_controller.add_definitions(node, [particles_sim_uv_attrib_definition, particles_sim_uv_varying_definition], ShaderName2.VERTEX);
    shaders_collection_controller.add_definitions(node, [particles_sim_uv_varying_definition], ShaderName2.FRAGMENT);
    shaders_collection_controller.add_body_lines(node, [`${GlobalsTextureHandler2.UV_VARYING} = ${GlobalsTextureHandler2.UV_ATTRIB}`], ShaderName2.VERTEX);
  }
};
export let GlobalsTextureHandler = GlobalsTextureHandler2;
GlobalsTextureHandler.UV_ATTRIB = "particles_sim_uv_attrib";
GlobalsTextureHandler.UV_VARYING = "particles_sim_uv_varying";
GlobalsTextureHandler.PARTICLE_SIM_UV = "particleUV";
