import {BaseGlShaderAssembler} from "../_Base";
import {ThreeToGl as ThreeToGl2} from "../../../../../../core/ThreeToGl";
import TemplateDefault from "../../templates/textures/Default.frag.glsl";
import {ShaderConfig as ShaderConfig2} from "../../configs/ShaderConfig";
import {VariableConfig as VariableConfig2} from "../../configs/VariableConfig";
import {ShaderName as ShaderName2} from "../../../../utils/shaders/ShaderName";
import {GlConnectionPointType, GlConnectionPoint} from "../../../../utils/io/connections/Gl";
import {UniformGLDefinition} from "../../../utils/GLDefinition";
import {BuilderCopNode} from "../../../../cop/Builder";
export class ShaderAssemblerTexture extends BaseGlShaderAssembler {
  get _template_shader() {
    return {
      fragmentShader: TemplateDefault,
      vertexShader: void 0,
      uniforms: void 0
    };
  }
  fragment_shader() {
    return this._shaders_by_name.get(ShaderName2.FRAGMENT);
  }
  uniforms() {
    return this._uniforms;
  }
  update_fragment_shader() {
    this._lines = new Map();
    this._shaders_by_name = new Map();
    for (let shader_name of this.shader_names) {
      if (shader_name == ShaderName2.FRAGMENT) {
        const template = this._template_shader.fragmentShader;
        this._lines.set(shader_name, template.split("\n"));
      }
    }
    if (this._root_nodes.length > 0) {
      this.build_code_from_nodes(this._root_nodes);
      this._build_lines();
    }
    this._uniforms = this._uniforms || {};
    this.add_uniforms(this._uniforms);
    for (let shader_name of this.shader_names) {
      const lines = this._lines.get(shader_name);
      if (lines) {
        this._shaders_by_name.set(shader_name, lines.join("\n"));
      }
    }
    BuilderCopNode.handle_dependencies(this._gl_parent_node, this.uniforms_time_dependent(), this._uniforms);
  }
  add_output_inputs(output_child) {
    output_child.io.inputs.set_named_input_connection_points([
      new GlConnectionPoint("color", GlConnectionPointType.VEC3),
      new GlConnectionPoint("alpha", GlConnectionPointType.FLOAT)
    ]);
  }
  add_globals_outputs(globals_node) {
    globals_node.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint("gl_FragCoord", GlConnectionPointType.VEC2),
      new GlConnectionPoint("time", GlConnectionPointType.FLOAT)
    ]);
  }
  create_shader_configs() {
    return [new ShaderConfig2(ShaderName2.FRAGMENT, ["color", "alpha"], [])];
  }
  create_variable_configs() {
    return [
      new VariableConfig2("color", {
        prefix: "diffuseColor.xyz = "
      }),
      new VariableConfig2("alpha", {
        prefix: "diffuseColor.a = ",
        default: "1.0"
      })
    ];
  }
  insert_define_after(shader_name) {
    return "// INSERT DEFINE";
  }
  insert_body_after(shader_name) {
    return "// INSERT BODY";
  }
  lines_to_remove(shader_name) {
    return ["// INSERT DEFINE", "// INSERT BODY"];
  }
  handle_gl_FragCoord(body_lines, shader_name, var_name) {
    if (shader_name == "fragment") {
      body_lines.push(`vec2 ${var_name} = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y)`);
    }
  }
  set_node_lines_output(output_node, shaders_collection_controller) {
    const input_names = this.input_names_for_shader_name(output_node, shaders_collection_controller.current_shader_name);
    if (input_names) {
      for (let input_name of input_names) {
        const input = output_node.io.inputs.named_input(input_name);
        if (input) {
          const gl_var = output_node.variable_for_input(input_name);
          let body_line;
          if (input_name == "color") {
            body_line = `diffuseColor.xyz = ${ThreeToGl2.any(gl_var)}`;
          }
          if (input_name == "alpha") {
            body_line = `diffuseColor.a = ${ThreeToGl2.any(gl_var)}`;
          }
          if (body_line) {
            shaders_collection_controller.add_body_lines(output_node, [body_line]);
          }
        }
      }
    }
  }
  set_node_lines_globals(globals_node, shaders_collection_controller) {
    const shader_name = shaders_collection_controller.current_shader_name;
    const shader_config = this.shader_config(shader_name);
    if (!shader_config) {
      return;
    }
    const body_lines = [];
    const definitions = [];
    for (let output_name of globals_node.io.outputs.used_output_names()) {
      const var_name = globals_node.gl_var_name(output_name);
      switch (output_name) {
        case "time":
          definitions.push(new UniformGLDefinition(globals_node, GlConnectionPointType.FLOAT, output_name));
          body_lines.push(`float ${var_name} = ${output_name}`);
          this.set_uniforms_time_dependent();
          break;
        case "gl_FragCoord":
          this.handle_gl_FragCoord(body_lines, shader_name, var_name);
          break;
      }
    }
    shaders_collection_controller.add_definitions(globals_node, definitions, shader_name);
    shaders_collection_controller.add_body_lines(globals_node, body_lines);
  }
}
