import {BaseGlShaderAssembler} from "../_Base";
import TemplateDefault from "../../templates/particles/Default.glsl";
import {AttributeGlNode} from "../../../Attribute";
import {TextureAllocationsController as TextureAllocationsController2} from "../../utils/TextureAllocationsController";
import {ThreeToGl as ThreeToGl2} from "../../../../../../core/ThreeToGl";
import {GlobalsGlNode} from "../../../Globals";
import {TypedNodeTraverser} from "../../../../utils/shaders/NodeTraverser";
import {OutputGlNode} from "../../../Output";
import {GlConnectionPointType, GlConnectionPoint} from "../../../../utils/io/connections/Gl";
import {UniformGLDefinition} from "../../../utils/GLDefinition";
export class ShaderAssemblerParticles extends BaseGlShaderAssembler {
  get _template_shader() {
    return void 0;
  }
  _template_shader_for_shader_name(shader_name) {
    return TemplateDefault;
  }
  compile() {
    this.setup_shader_names_and_variables();
    this.update_shaders();
  }
  root_nodes_by_shader_name(shader_name) {
    const list = [];
    for (let node of this._root_nodes) {
      switch (node.type) {
        case OutputGlNode.type(): {
          list.push(node);
          break;
        }
        case AttributeGlNode.type(): {
          const attrib_name = node.attribute_name;
          const variable = this._texture_allocations_controller?.variable(attrib_name);
          if (variable && variable.allocation) {
            const allocation_shader_name = variable.allocation.shader_name;
            if (allocation_shader_name == shader_name) {
              list.push(node);
            }
          }
          break;
        }
      }
    }
    return list;
  }
  leaf_nodes_by_shader_name(shader_name) {
    const list = [];
    for (let node of this._leaf_nodes) {
      switch (node.type) {
        case GlobalsGlNode.type(): {
          list.push(node);
          break;
        }
        case AttributeGlNode.type(): {
          const attrib_name = node.attribute_name;
          const variable = this._texture_allocations_controller?.variable(attrib_name);
          if (variable && variable.allocation) {
            const allocation_shader_name = variable.allocation.shader_name;
            if (allocation_shader_name == shader_name) {
              list.push(node);
            }
          }
          break;
        }
      }
    }
    return list;
  }
  setup_shader_names_and_variables() {
    const node_traverser = new TypedNodeTraverser(this._gl_parent_node, this.shader_names, (root_node, shader_name) => {
      return this.input_names_for_shader_name(root_node, shader_name);
    });
    this._leaf_nodes = node_traverser.leaves_from_nodes(this._root_nodes);
    this._texture_allocations_controller = new TextureAllocationsController2();
    this._texture_allocations_controller.allocate_connections_from_root_nodes(this._root_nodes, this._leaf_nodes);
    if (this.globals_handler) {
      this.globals_handler?.set_texture_allocations_controller(this._texture_allocations_controller);
    }
    this._reset_shader_configs();
  }
  update_shaders() {
    this._shaders_by_name = new Map();
    this._lines = new Map();
    for (let shader_name of this.shader_names) {
      const template = this._template_shader_for_shader_name(shader_name);
      this._lines.set(shader_name, template.split("\n"));
    }
    if (this._root_nodes.length > 0) {
      this.build_code_from_nodes(this._root_nodes);
      this._build_lines();
    }
    for (let shader_name of this.shader_names) {
      const lines = this._lines.get(shader_name);
      if (lines) {
        this._shaders_by_name.set(shader_name, lines.join("\n"));
      }
    }
  }
  add_output_inputs(output_child) {
    output_child.io.inputs.set_named_input_connection_points([
      new GlConnectionPoint("position", GlConnectionPointType.VEC3),
      new GlConnectionPoint("velocity", GlConnectionPointType.VEC3)
    ]);
  }
  add_globals_outputs(globals_node) {
    globals_node.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint("position", GlConnectionPointType.VEC3),
      new GlConnectionPoint("velocity", GlConnectionPointType.VEC3),
      new GlConnectionPoint("time", GlConnectionPointType.FLOAT)
    ]);
  }
  allow_attribute_exports() {
    return true;
  }
  get texture_allocations_controller() {
    return this._texture_allocations_controller = this._texture_allocations_controller || new TextureAllocationsController2();
  }
  create_shader_configs() {
    return this._texture_allocations_controller?.create_shader_configs() || [];
  }
  create_variable_configs() {
    return [];
  }
  get shader_names() {
    return this.texture_allocations_controller.shader_names() || [];
  }
  input_names_for_shader_name(root_node, shader_name) {
    return this.texture_allocations_controller.input_names_for_shader_name(root_node, shader_name) || [];
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
  add_export_body_line(export_node, input_name, input, variable_name, shaders_collection_controller) {
    if (input) {
      const var_input = export_node.variable_for_input(input_name);
      const new_var = ThreeToGl2.vector3(var_input);
      if (new_var) {
        const texture_variable = this.texture_allocations_controller.variable(variable_name);
        const shader_name = shaders_collection_controller.current_shader_name;
        if (texture_variable && texture_variable.allocation?.shader_name == shader_name) {
          const component = texture_variable.component;
          const line = `gl_FragColor.${component} = ${new_var}`;
          shaders_collection_controller.add_body_lines(export_node, [line], shader_name);
        }
      }
    }
  }
  set_node_lines_output(output_node, shaders_collection_controller) {
    const shader_name = shaders_collection_controller.current_shader_name;
    const input_names = this.texture_allocations_controller.input_names_for_shader_name(output_node, shader_name);
    if (input_names) {
      for (let input_name of input_names) {
        const input = output_node.io.inputs.named_input(input_name);
        if (input) {
          const variable_name = input_name;
          this.add_export_body_line(output_node, input_name, input, variable_name, shaders_collection_controller);
        } else {
        }
      }
    }
  }
  set_node_lines_attribute(attribute_node, shaders_collection_controller) {
    if (attribute_node.is_importing) {
      const gl_type = attribute_node.gl_type();
      const attribute_name = attribute_node.attribute_name;
      const new_value = this.globals_handler?.read_attribute(attribute_node, gl_type, attribute_name, shaders_collection_controller);
      const var_name = attribute_node.gl_var_name(attribute_node.output_name);
      const body_line = `${gl_type} ${var_name} = ${new_value}`;
      shaders_collection_controller.add_body_lines(attribute_node, [body_line]);
      const texture_variable = this.texture_allocations_controller.variable(attribute_name);
      const shader_name = shaders_collection_controller.current_shader_name;
      if (texture_variable && texture_variable.allocation?.shader_name == shader_name) {
        const variable = this.texture_allocations_controller.variable(attribute_name);
        if (variable) {
          const component = variable.component;
          const body_line2 = `gl_FragColor.${component} = ${var_name}`;
          shaders_collection_controller.add_body_lines(attribute_node, [body_line2]);
        }
      }
    }
    if (attribute_node.is_exporting) {
      const input = attribute_node.connected_input_node();
      if (input) {
        const variable_name = attribute_node.attribute_name;
        this.add_export_body_line(attribute_node, attribute_node.input_name, input, variable_name, shaders_collection_controller);
      }
    }
  }
  set_node_lines_globals(globals_node, shaders_collection_controller) {
    for (let output_name of globals_node.io.outputs.used_output_names()) {
      switch (output_name) {
        case "time":
          this._handle_globals_time(globals_node, output_name, shaders_collection_controller);
          break;
        default:
          this._handle_globals_default(globals_node, output_name, shaders_collection_controller);
      }
    }
  }
  _handle_globals_time(globals_node, output_name, shaders_collection_controller) {
    const definition = new UniformGLDefinition(globals_node, GlConnectionPointType.FLOAT, output_name);
    shaders_collection_controller.add_definitions(globals_node, [definition]);
    const var_name = globals_node.gl_var_name(output_name);
    const body_line = `float ${var_name} = ${output_name}`;
    shaders_collection_controller.add_body_lines(globals_node, [body_line]);
    this.set_uniforms_time_dependent();
  }
  _handle_globals_default(globals_node, output_name, shaders_collection_controller) {
    const output_connection_point = globals_node.io.outputs.named_output_connection_points_by_name(output_name);
    if (output_connection_point) {
      const gl_type = output_connection_point.type;
      const attrib_read = this.globals_handler?.read_attribute(globals_node, gl_type, output_name, shaders_collection_controller);
      if (attrib_read) {
        const var_name = globals_node.gl_var_name(output_name);
        const body_line = `${gl_type} ${var_name} = ${attrib_read}`;
        shaders_collection_controller.add_body_lines(globals_node, [body_line]);
      }
    }
  }
}
