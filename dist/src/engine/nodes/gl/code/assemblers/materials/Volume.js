import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {BaseShaderAssemblerVolume} from "./_BaseVolume";
import {ShaderName as ShaderName2} from "../../../../utils/shaders/ShaderName";
import {GlConnectionPointType, GlConnectionPoint} from "../../../../utils/io/connections/Gl";
import {FrontSide} from "three/src/constants";
import {CoreMaterial} from "../../../../../../core/geometry/Material";
import {VolumeController as VolumeController2} from "../../../../mat/utils/VolumeController";
import {ShaderConfig as ShaderConfig2} from "../../configs/ShaderConfig";
import {VariableConfig as VariableConfig2} from "../../configs/VariableConfig";
import {UniformGLDefinition} from "../../../utils/GLDefinition";
import {MapUtils as MapUtils2} from "../../../../../../core/MapUtils";
import VERTEX from "../../../gl/volume/vert.glsl";
import FRAGMENT from "../../../gl/volume/frag.glsl";
import {VOLUME_UNIFORMS} from "../../../gl/volume/uniforms";
const INSERT_BODY_AFTER_MAP = new Map([
  [ShaderName2.VERTEX, "// start builder body code"],
  [ShaderName2.FRAGMENT, "// start builder body code"]
]);
const LINES_TO_REMOVE_MAP = new Map([[ShaderName2.FRAGMENT, []]]);
export class ShaderAssemblerVolume extends BaseShaderAssemblerVolume {
  get _template_shader() {
    return {
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: UniformsUtils2.clone(VOLUME_UNIFORMS)
    };
  }
  create_material() {
    const template_shader = this._template_shader;
    const material = new ShaderMaterial2({
      vertexShader: template_shader.vertexShader,
      fragmentShader: template_shader.fragmentShader,
      side: FrontSide,
      transparent: true,
      depthTest: true,
      uniforms: UniformsUtils2.clone(template_shader.uniforms)
    });
    CoreMaterial.add_user_data_render_hook(material, VolumeController2.render_hook.bind(VolumeController2));
    this._add_custom_materials(material);
    return material;
  }
  add_output_inputs(output_child) {
    output_child.io.inputs.set_named_input_connection_points([
      new GlConnectionPoint("density", GlConnectionPointType.FLOAT, 1)
    ]);
  }
  static create_globals_node_output_connections() {
    return [
      new GlConnectionPoint("position", GlConnectionPointType.VEC3),
      new GlConnectionPoint("pos_normalized", GlConnectionPointType.VEC3),
      new GlConnectionPoint("time", GlConnectionPointType.FLOAT)
    ];
  }
  create_globals_node_output_connections() {
    return ShaderAssemblerVolume.create_globals_node_output_connections();
  }
  insert_body_after(shader_name) {
    return INSERT_BODY_AFTER_MAP.get(shader_name);
  }
  lines_to_remove(shader_name) {
    return LINES_TO_REMOVE_MAP.get(shader_name);
  }
  create_shader_configs() {
    return [
      new ShaderConfig2(ShaderName2.VERTEX, [], []),
      new ShaderConfig2(ShaderName2.FRAGMENT, ["density"], [ShaderName2.VERTEX])
    ];
  }
  static create_variable_configs() {
    return [
      new VariableConfig2("position", {}),
      new VariableConfig2("density", {
        prefix: "density *= "
      })
    ];
  }
  create_variable_configs() {
    return ShaderAssemblerVolume.create_variable_configs();
  }
  set_node_lines_globals(globals_node, shaders_collection_controller) {
    const body_lines = [];
    const shader_name = shaders_collection_controller.current_shader_name;
    const shader_config = this.shader_config(shader_name);
    if (!shader_config) {
      return;
    }
    const dependencies = shader_config.dependencies();
    const definitions_by_shader_name = new Map();
    const body_lines_by_shader_name = new Map();
    let definition;
    let body_line;
    for (let output_name of globals_node.io.outputs.used_output_names()) {
      const var_name = globals_node.gl_var_name(output_name);
      const globals_shader_name = shaders_collection_controller.current_shader_name;
      switch (output_name) {
        case "time":
          definition = new UniformGLDefinition(globals_node, GlConnectionPointType.FLOAT, output_name);
          if (globals_shader_name) {
            MapUtils2.push_on_array_at_entry(definitions_by_shader_name, globals_shader_name, definition);
          }
          body_line = `float ${var_name} = ${output_name}`;
          for (let dependency of dependencies) {
            MapUtils2.push_on_array_at_entry(definitions_by_shader_name, dependency, definition);
            MapUtils2.push_on_array_at_entry(body_lines_by_shader_name, dependency, body_line);
          }
          body_lines.push(body_line);
          this.set_uniforms_time_dependent();
          break;
        case "position":
          if (shader_name == ShaderName2.FRAGMENT) {
            body_lines.push(`vec3 ${var_name} = position_for_step`);
          }
          break;
        case "pos_normalized":
          if (shader_name == ShaderName2.FRAGMENT) {
            body_lines.push(`vec3 ${var_name} = (position_for_step - u_BoundingBoxMax) / (u_BoundingBoxMax - u_BoundingBoxMin)`);
          }
          break;
      }
    }
    definitions_by_shader_name.forEach((definitions, shader_name2) => {
      shaders_collection_controller.add_definitions(globals_node, definitions, shader_name2);
    });
    body_lines_by_shader_name.forEach((body_lines2, shader_name2) => {
      shaders_collection_controller.add_body_lines(globals_node, body_lines2, shader_name2);
    });
    shaders_collection_controller.add_body_lines(globals_node, body_lines);
  }
}
