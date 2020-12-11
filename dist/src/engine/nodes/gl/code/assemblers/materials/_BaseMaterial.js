import {BaseGlShaderAssembler} from "../_Base";
import {ThreeToGl as ThreeToGl2} from "../../../../../../core/ThreeToGl";
import {ShaderName as ShaderName2} from "../../../../utils/shaders/ShaderName";
import {UniformGLDefinition, VaryingGLDefinition} from "../../../utils/GLDefinition";
import {GlConnectionPointType} from "../../../../utils/io/connections/Gl";
import {MapUtils as MapUtils2} from "../../../../../../core/MapUtils";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {GlNodeFinder} from "../../utils/NodeFinder";
export var CustomMaterialName;
(function(CustomMaterialName2) {
  CustomMaterialName2["DISTANCE"] = "customDistanceMaterial";
  CustomMaterialName2["DEPTH"] = "customDepthMaterial";
  CustomMaterialName2["DEPTH_DOF"] = "customDepthDOFMaterial";
})(CustomMaterialName || (CustomMaterialName = {}));
export var GlobalsOutput;
(function(GlobalsOutput2) {
  GlobalsOutput2["TIME"] = "time";
  GlobalsOutput2["RESOLUTION"] = "resolution";
  GlobalsOutput2["MV_POSITION"] = "mvPosition";
  GlobalsOutput2["GL_POSITION"] = "gl_Position";
  GlobalsOutput2["GL_FRAGCOORD"] = "gl_FragCoord";
  GlobalsOutput2["GL_POINTCOORD"] = "gl_PointCoord";
})(GlobalsOutput || (GlobalsOutput = {}));
const FRAGMENT_GLOBALS_OUTPUT = [
  GlobalsOutput.GL_FRAGCOORD,
  GlobalsOutput.GL_POINTCOORD
];
export class ShaderAssemblerMaterial extends BaseGlShaderAssembler {
  constructor() {
    super(...arguments);
    this._assemblers_by_custom_name = new Map();
  }
  create_material() {
    return new ShaderMaterial2();
  }
  custom_assembler_class_by_custom_name() {
    return void 0;
  }
  _add_custom_materials(material) {
    const class_by_custom_name = this.custom_assembler_class_by_custom_name();
    if (class_by_custom_name) {
      class_by_custom_name.forEach((assembler_class, custom_name) => {
        this._add_custom_material(material, custom_name, assembler_class);
      });
    }
  }
  _add_custom_material(material, custom_name, assembler_class) {
    let custom_assembler = this._assemblers_by_custom_name.get(custom_name);
    if (!custom_assembler) {
      custom_assembler = new assembler_class(this._gl_parent_node);
      this._assemblers_by_custom_name.set(custom_name, custom_assembler);
    }
    material.custom_materials = material.custom_materials || {};
    material.custom_materials[custom_name] = custom_assembler.create_material();
  }
  compile_custom_materials(material) {
    const class_by_custom_name = this.custom_assembler_class_by_custom_name();
    if (class_by_custom_name) {
      class_by_custom_name.forEach((assembler_class, custom_name) => {
        if (this._code_builder) {
          let assembler = this._assemblers_by_custom_name.get(custom_name);
          if (!assembler) {
            assembler = new assembler_class(this._gl_parent_node);
            this._assemblers_by_custom_name.set(custom_name, assembler);
          }
          assembler.set_root_nodes(this._root_nodes);
          assembler.set_param_configs_owner(this._code_builder);
          assembler.set_shader_configs(this.shader_configs);
          assembler.set_variable_configs(this.variable_configs());
          const custom_material = material.custom_materials[custom_name];
          if (custom_material) {
            assembler.compile_material(custom_material);
          }
        }
      });
    }
  }
  compile_material(material) {
    if (!this.compile_allowed()) {
      return;
    }
    const output_nodes = GlNodeFinder.find_output_nodes(this._gl_parent_node);
    if (output_nodes.length > 1) {
      this._gl_parent_node.states.error.set("only one output node allowed");
    }
    const varying_nodes = GlNodeFinder.find_varying_nodes(this._gl_parent_node);
    const root_nodes = output_nodes.concat(varying_nodes);
    this.set_root_nodes(root_nodes);
    this._update_shaders();
    const new_vertex_shader = this._shaders_by_name.get(ShaderName2.VERTEX);
    const new_fragment_shader = this._shaders_by_name.get(ShaderName2.FRAGMENT);
    if (new_vertex_shader && new_fragment_shader) {
      material.vertexShader = new_vertex_shader;
      material.fragmentShader = new_fragment_shader;
      this.add_uniforms(material.uniforms);
      material.needsUpdate = true;
    }
    const scene = this._gl_parent_node.scene;
    if (this.uniforms_time_dependent()) {
      scene.uniforms_controller.add_time_dependent_uniform_owner(material.uuid, material.uniforms);
    } else {
      scene.uniforms_controller.remove_time_dependent_uniform_owner(material.uuid);
    }
    if (material.custom_materials) {
      this.compile_custom_materials(material);
    }
  }
  _update_shaders() {
    this._shaders_by_name = new Map();
    this._lines = new Map();
    for (let shader_name of this.shader_names) {
      const template = this._template_shader_for_shader_name(shader_name);
      if (template) {
        this._lines.set(shader_name, template.split("\n"));
      }
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
  shadow_assembler_class_by_custom_name() {
    return {};
  }
  add_output_body_line(output_node, shaders_collection_controller, input_name) {
    const input = output_node.io.inputs.named_input(input_name);
    const var_input = output_node.variable_for_input(input_name);
    const variable_config = this.variable_config(input_name);
    let new_var = null;
    if (input) {
      new_var = ThreeToGl2.vector3(var_input);
    } else {
      if (variable_config.default_from_attribute()) {
        const connection_point = output_node.io.inputs.named_input_connection_points_by_name(input_name);
        if (connection_point) {
          const gl_type = connection_point.type;
          const attr_read = this.globals_handler?.read_attribute(output_node, gl_type, input_name, shaders_collection_controller);
          if (attr_read) {
            new_var = attr_read;
          }
        }
      } else {
        const variable_config_default = variable_config.default();
        if (variable_config_default) {
          new_var = variable_config_default;
        }
      }
    }
    if (new_var) {
      const prefix = variable_config.prefix();
      const suffix = variable_config.suffix();
      const if_condition = variable_config.if_condition();
      if (if_condition) {
        shaders_collection_controller.add_body_lines(output_node, [`#if ${if_condition}`]);
      }
      shaders_collection_controller.add_body_lines(output_node, [`${prefix}${new_var}${suffix}`]);
      if (if_condition) {
        shaders_collection_controller.add_body_lines(output_node, [`#endif`]);
      }
    }
  }
  set_node_lines_output(output_node, shaders_collection_controller) {
    const shader_name = shaders_collection_controller.current_shader_name;
    const input_names = this.shader_config(shader_name)?.input_names();
    if (input_names) {
      for (let input_name of input_names) {
        if (output_node.io.inputs.has_named_input(input_name)) {
          this.add_output_body_line(output_node, shaders_collection_controller, input_name);
        }
      }
    }
  }
  set_node_lines_attribute(attribute_node, shaders_collection_controller) {
    const gl_type = attribute_node.gl_type();
    const new_var = this.globals_handler?.read_attribute(attribute_node, gl_type, attribute_node.attribute_name, shaders_collection_controller);
    const var_name = attribute_node.gl_var_name(attribute_node.output_name);
    shaders_collection_controller.add_body_lines(attribute_node, [`${gl_type} ${var_name} = ${new_var}`]);
  }
  handle_globals_output_name(options) {
    switch (options.output_name) {
      case GlobalsOutput.TIME:
        this.handle_time(options);
        return;
      case GlobalsOutput.RESOLUTION:
        this.handle_resolution(options);
        return;
      case GlobalsOutput.MV_POSITION:
        this.handle_mvPosition(options);
        return;
      case GlobalsOutput.GL_POSITION:
        this.handle_gl_Position(options);
        return;
      case GlobalsOutput.GL_FRAGCOORD:
        this.handle_gl_FragCoord(options);
        return;
      case GlobalsOutput.GL_POINTCOORD:
        this.handle_gl_PointCoord(options);
        return;
      default:
        this.globals_handler?.handle_globals_node(options.globals_node, options.output_name, options.shaders_collection_controller);
    }
  }
  handle_time(options) {
    const definition = new UniformGLDefinition(options.globals_node, GlConnectionPointType.FLOAT, options.output_name);
    if (options.globals_shader_name) {
      MapUtils2.push_on_array_at_entry(options.definitions_by_shader_name, options.globals_shader_name, definition);
    }
    const body_line = `float ${options.var_name} = ${options.output_name}`;
    for (let dependency of options.dependencies) {
      MapUtils2.push_on_array_at_entry(options.definitions_by_shader_name, dependency, definition);
      MapUtils2.push_on_array_at_entry(options.body_lines_by_shader_name, dependency, body_line);
    }
    options.body_lines.push(body_line);
    this.set_uniforms_time_dependent();
  }
  handle_resolution(options) {
    if (options.shader_name == ShaderName2.FRAGMENT) {
      options.body_lines.push(`vec2 ${options.var_name} = resolution`);
    }
    const definition = new UniformGLDefinition(options.globals_node, GlConnectionPointType.VEC2, options.output_name);
    if (options.globals_shader_name) {
      MapUtils2.push_on_array_at_entry(options.definitions_by_shader_name, options.globals_shader_name, definition);
    }
    for (let dependency of options.dependencies) {
      MapUtils2.push_on_array_at_entry(options.definitions_by_shader_name, dependency, definition);
    }
    this.set_resolution_dependent();
  }
  handle_mvPosition(options) {
    if (options.shader_name == ShaderName2.FRAGMENT) {
      const globals_node = options.globals_node;
      const shaders_collection_controller = options.shaders_collection_controller;
      const definition = new VaryingGLDefinition(globals_node, GlConnectionPointType.VEC4, options.var_name);
      const vertex_body_line = `${options.var_name} = modelViewMatrix * vec4(position, 1.0)`;
      shaders_collection_controller.add_definitions(globals_node, [definition], ShaderName2.VERTEX);
      shaders_collection_controller.add_body_lines(globals_node, [vertex_body_line], ShaderName2.VERTEX);
      shaders_collection_controller.add_definitions(globals_node, [definition]);
    }
  }
  handle_gl_Position(options) {
    if (options.shader_name == ShaderName2.FRAGMENT) {
      const globals_node = options.globals_node;
      const shaders_collection_controller = options.shaders_collection_controller;
      const definition = new VaryingGLDefinition(globals_node, GlConnectionPointType.VEC4, options.var_name);
      const vertex_body_line = `${options.var_name} = projectionMatrix * modelViewMatrix * vec4(position, 1.0)`;
      shaders_collection_controller.add_definitions(globals_node, [definition], ShaderName2.VERTEX);
      shaders_collection_controller.add_body_lines(globals_node, [vertex_body_line], ShaderName2.VERTEX);
      shaders_collection_controller.add_definitions(globals_node, [definition]);
    }
  }
  handle_gl_FragCoord(options) {
    if (options.shader_name == ShaderName2.FRAGMENT) {
      options.body_lines.push(`vec4 ${options.var_name} = gl_FragCoord`);
    }
  }
  handle_gl_PointCoord(options) {
    if (options.shader_name == ShaderName2.FRAGMENT) {
      options.body_lines.push(`vec2 ${options.var_name} = gl_PointCoord`);
    } else {
      options.body_lines.push(`vec2 ${options.var_name} = vec2(0.0, 0.0)`);
    }
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
    const used_output_names = this.used_output_names_for_shader(globals_node, shader_name);
    for (let output_name of used_output_names) {
      const var_name = globals_node.gl_var_name(output_name);
      const globals_shader_name = shaders_collection_controller.current_shader_name;
      const options = {
        globals_node,
        shaders_collection_controller,
        output_name,
        globals_shader_name,
        definitions_by_shader_name,
        body_lines,
        var_name,
        shader_name,
        dependencies,
        body_lines_by_shader_name
      };
      this.handle_globals_output_name(options);
    }
    definitions_by_shader_name.forEach((definitions, shader_name2) => {
      shaders_collection_controller.add_definitions(globals_node, definitions, shader_name2);
    });
    body_lines_by_shader_name.forEach((body_lines2, shader_name2) => {
      shaders_collection_controller.add_body_lines(globals_node, body_lines2, shader_name2);
    });
    shaders_collection_controller.add_body_lines(globals_node, body_lines);
  }
  used_output_names_for_shader(globals_node, shader_name) {
    const used_output_names = globals_node.io.outputs.used_output_names();
    const filtered_names = [];
    for (let name of used_output_names) {
      if (shader_name == ShaderName2.VERTEX) {
        if (!FRAGMENT_GLOBALS_OUTPUT.includes(name)) {
          filtered_names.push(name);
        }
      } else {
        filtered_names.push(name);
      }
    }
    return filtered_names;
  }
}
