import {Vector2 as Vector22} from "three/src/math/Vector2";
import {LineType as LineType2} from "../utils/LineType";
import {ShaderConfig as ShaderConfig2} from "../configs/ShaderConfig";
import {VariableConfig as VariableConfig2} from "../configs/VariableConfig";
import {CodeBuilder as CodeBuilder2} from "../utils/CodeBuilder";
import {GlobalsGeometryHandler} from "../globals/Geometry";
import {TypedAssembler} from "../../../utils/shaders/BaseAssembler";
import {ShaderName as ShaderName2} from "../../../utils/shaders/ShaderName";
import {OutputGlNode} from "../../Output";
import {GlConnectionPoint, GlConnectionPointType} from "../../../utils/io/connections/Gl";
import {GlobalsGlNode} from "../../Globals";
import {AttributeGlNode} from "../../Attribute";
import {ParamGlNode} from "../../Param";
import {ShaderChunk as ShaderChunk2} from "three/src/renderers/shaders/ShaderChunk";
import {TypedNodeTraverser} from "../../../utils/shaders/NodeTraverser";
import {GlNodeFinder} from "../utils/NodeFinder";
import {VaryingWriteGlNode} from "../../VaryingWrite";
const INSERT_DEFINE_AFTER_MAP = new Map([
  [ShaderName2.VERTEX, "#include <common>"],
  [ShaderName2.FRAGMENT, "#include <common>"]
]);
const INSERT_BODY_AFTER_MAP = new Map([
  [ShaderName2.VERTEX, "#include <color_vertex>"],
  [ShaderName2.FRAGMENT, "vec4 diffuseColor = vec4( diffuse, opacity );"]
]);
const LINES_TO_REMOVE_MAP = new Map([
  [ShaderName2.VERTEX, ["#include <begin_vertex>", "#include <beginnormal_vertex>"]],
  [ShaderName2.FRAGMENT, []]
]);
const SPACED_LINES = 3;
export class BaseGlShaderAssembler extends TypedAssembler {
  constructor(_gl_parent_node) {
    super();
    this._gl_parent_node = _gl_parent_node;
    this._shaders_by_name = new Map();
    this._lines = new Map();
    this._root_nodes = [];
    this._leaf_nodes = [];
    this._uniforms_time_dependent = false;
    this._resolution_dependent = false;
  }
  compile() {
  }
  _template_shader_for_shader_name(shader_name) {
    switch (shader_name) {
      case ShaderName2.VERTEX:
        return this._template_shader?.vertexShader;
      case ShaderName2.FRAGMENT:
        return this._template_shader?.fragmentShader;
    }
  }
  get globals_handler() {
    return this._gl_parent_node.assembler_controller?.globals_handler;
  }
  compile_allowed() {
    return this._gl_parent_node.assembler_controller?.globals_handler != null;
  }
  shaders_by_name() {
    return this._shaders_by_name;
  }
  _build_lines() {
    for (let shader_name of this.shader_names) {
      const template = this._template_shader_for_shader_name(shader_name);
      if (template) {
        this._replace_template(template, shader_name);
      }
    }
  }
  set_root_nodes(root_nodes) {
    this._root_nodes = root_nodes;
  }
  get _template_shader() {
    return void 0;
  }
  add_uniforms(current_uniforms) {
    for (let param_config of this.param_configs()) {
      current_uniforms[param_config.uniform_name] = param_config.uniform;
    }
    if (this.uniforms_time_dependent()) {
      current_uniforms["time"] = {
        value: this._gl_parent_node.scene.time
      };
    }
    if (this.resolution_dependent()) {
      current_uniforms["resolution"] = {
        value: new Vector22(1e3, 1e3)
      };
    }
  }
  root_nodes_by_shader_name(shader_name) {
    const list = [];
    for (let node of this._root_nodes) {
      switch (node.type) {
        case OutputGlNode.type(): {
          list.push(node);
          break;
        }
        case ParamGlNode.type(): {
          list.push(node);
          break;
        }
        case AttributeGlNode.type(): {
        }
        case VaryingWriteGlNode.type(): {
          list.push(node);
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
        }
      }
    }
    return list;
  }
  set_node_lines_globals(globals_node, shaders_collection_controller) {
  }
  set_node_lines_output(output_node, shaders_collection_controller) {
  }
  set_node_lines_attribute(attribute_node, shaders_collection_controller) {
  }
  get code_builder() {
    return this._code_builder = this._code_builder || this._create_code_builder();
  }
  _create_code_builder() {
    const node_traverser = new TypedNodeTraverser(this._gl_parent_node, this.shader_names, (root_node, shader_name) => {
      return this.input_names_for_shader_name(root_node, shader_name);
    });
    return new CodeBuilder2(node_traverser, (shader_name) => {
      return this.root_nodes_by_shader_name(shader_name);
    });
  }
  build_code_from_nodes(root_nodes) {
    const param_nodes = GlNodeFinder.find_param_generating_nodes(this._gl_parent_node);
    this.code_builder.build_from_nodes(root_nodes, param_nodes);
  }
  allow_new_param_configs() {
    this.code_builder.allow_new_param_configs();
  }
  disallow_new_param_configs() {
    this.code_builder.disallow_new_param_configs();
  }
  builder_param_configs() {
    return this.code_builder.param_configs();
  }
  builder_lines(shader_name, line_type) {
    return this.code_builder.lines(shader_name, line_type);
  }
  all_builder_lines() {
    return this.code_builder.all_lines();
  }
  param_configs() {
    const code_builder = this._param_config_owner || this.code_builder;
    return code_builder.param_configs();
  }
  set_param_configs_owner(param_config_owner) {
    this._param_config_owner = param_config_owner;
    if (this._param_config_owner) {
      this.code_builder.disallow_new_param_configs();
    } else {
      this.code_builder.allow_new_param_configs();
    }
  }
  static output_input_connection_points() {
    return [
      new GlConnectionPoint("position", GlConnectionPointType.VEC3),
      new GlConnectionPoint("normal", GlConnectionPointType.VEC3),
      new GlConnectionPoint("color", GlConnectionPointType.VEC3),
      new GlConnectionPoint("alpha", GlConnectionPointType.FLOAT),
      new GlConnectionPoint("uv", GlConnectionPointType.VEC2)
    ];
  }
  add_output_inputs(output_child) {
    output_child.io.inputs.set_named_input_connection_points(BaseGlShaderAssembler.output_input_connection_points());
  }
  static create_globals_node_output_connections() {
    return [
      new GlConnectionPoint("position", GlConnectionPointType.VEC3),
      new GlConnectionPoint("normal", GlConnectionPointType.VEC3),
      new GlConnectionPoint("color", GlConnectionPointType.VEC3),
      new GlConnectionPoint("uv", GlConnectionPointType.VEC2),
      new GlConnectionPoint("mvPosition", GlConnectionPointType.VEC4),
      new GlConnectionPoint("gl_Position", GlConnectionPointType.VEC4),
      new GlConnectionPoint("gl_FragCoord", GlConnectionPointType.VEC4),
      new GlConnectionPoint("cameraPosition", GlConnectionPointType.VEC3),
      new GlConnectionPoint("resolution", GlConnectionPointType.VEC2),
      new GlConnectionPoint("time", GlConnectionPointType.FLOAT)
    ];
  }
  create_globals_node_output_connections() {
    return BaseGlShaderAssembler.create_globals_node_output_connections();
  }
  add_globals_outputs(globals_node) {
    globals_node.io.outputs.set_named_output_connection_points(this.create_globals_node_output_connections());
  }
  allow_attribute_exports() {
    return false;
  }
  reset_configs() {
    this._reset_shader_configs();
    this._reset_variable_configs();
    this._reset_uniforms_time_dependency();
    this._reset_resolution_dependency();
  }
  get shader_configs() {
    return this._shader_configs = this._shader_configs || this.create_shader_configs();
  }
  set_shader_configs(shader_configs) {
    this._shader_configs = shader_configs;
  }
  get shader_names() {
    return this.shader_configs?.map((sc) => sc.name()) || [];
  }
  _reset_shader_configs() {
    this._shader_configs = void 0;
  }
  create_shader_configs() {
    return [
      new ShaderConfig2(ShaderName2.VERTEX, ["position", "normal", "uv", VaryingWriteGlNode.INPUT_NAME], []),
      new ShaderConfig2(ShaderName2.FRAGMENT, ["color", "alpha"], [ShaderName2.VERTEX])
    ];
  }
  shader_config(name) {
    return this.shader_configs?.filter((sc) => {
      return sc.name() == name;
    })[0];
  }
  variable_configs() {
    return this._variable_configs = this._variable_configs || this.create_variable_configs();
  }
  set_variable_configs(variable_configs) {
    this._variable_configs = variable_configs;
  }
  variable_config(name) {
    return this.variable_configs().filter((vc) => {
      return vc.name() == name;
    })[0];
  }
  static create_variable_configs() {
    return [
      new VariableConfig2("position", {
        default_from_attribute: true,
        prefix: "vec3 transformed = "
      }),
      new VariableConfig2("normal", {
        default_from_attribute: true,
        prefix: "vec3 objectNormal = "
      }),
      new VariableConfig2("color", {
        prefix: "diffuseColor.xyz = "
      }),
      new VariableConfig2("alpha", {
        prefix: "diffuseColor.a = "
      }),
      new VariableConfig2("uv", {
        prefix: "vUv = ",
        if: GlobalsGeometryHandler.IF_RULE.uv
      })
    ];
  }
  create_variable_configs() {
    return BaseGlShaderAssembler.create_variable_configs();
  }
  _reset_variable_configs() {
    this._variable_configs = void 0;
    this.variable_configs();
  }
  input_names_for_shader_name(root_node, shader_name) {
    return this.shader_config(shader_name)?.input_names() || [];
  }
  _reset_uniforms_time_dependency() {
    this._uniforms_time_dependent = false;
  }
  set_uniforms_time_dependent() {
    this._uniforms_time_dependent = true;
  }
  uniforms_time_dependent() {
    return this._uniforms_time_dependent;
  }
  _reset_resolution_dependency() {
    this._resolution_dependent = false;
  }
  set_resolution_dependent() {
    this._resolution_dependent = true;
  }
  resolution_dependent() {
    return this._resolution_dependent;
  }
  insert_define_after(shader_name) {
    return INSERT_DEFINE_AFTER_MAP.get(shader_name);
  }
  insert_body_after(shader_name) {
    return INSERT_BODY_AFTER_MAP.get(shader_name);
  }
  lines_to_remove(shader_name) {
    return LINES_TO_REMOVE_MAP.get(shader_name);
  }
  _replace_template(template, shader_name) {
    const function_declaration = this.builder_lines(shader_name, LineType2.FUNCTION_DECLARATION);
    const define = this.builder_lines(shader_name, LineType2.DEFINE);
    const body = this.builder_lines(shader_name, LineType2.BODY);
    let template_lines = template.split("\n");
    const new_lines = [];
    const line_before_define = this.insert_define_after(shader_name);
    const line_before_body = this.insert_body_after(shader_name);
    const lines_to_remove = this.lines_to_remove(shader_name);
    let line_before_define_found = false;
    let line_before_body_found = false;
    for (let template_line of template_lines) {
      if (line_before_define_found == true) {
        if (function_declaration) {
          this._insert_lines(new_lines, function_declaration);
        }
        if (define) {
          this._insert_lines(new_lines, define);
        }
        line_before_define_found = false;
      }
      if (line_before_body_found == true) {
        if (body) {
          this._insert_lines(new_lines, body);
        }
        line_before_body_found = false;
      }
      let line_remove_required = false;
      if (lines_to_remove) {
        for (let line_to_remove of lines_to_remove) {
          if (template_line.indexOf(line_to_remove) >= 0) {
            line_remove_required = true;
          }
        }
      }
      if (!line_remove_required) {
        new_lines.push(template_line);
      } else {
        new_lines.push("// removed:");
        new_lines.push(`//${template_line}`);
      }
      if (line_before_define && template_line.indexOf(line_before_define) >= 0) {
        line_before_define_found = true;
      }
      if (line_before_body && template_line.indexOf(line_before_body) >= 0) {
        line_before_body_found = true;
      }
    }
    this._lines.set(shader_name, new_lines);
  }
  _insert_lines(new_lines, lines_to_add) {
    if (lines_to_add.length > 0) {
      for (let i = 0; i < SPACED_LINES; i++) {
        new_lines.push("");
      }
      for (let line_to_add of lines_to_add) {
        new_lines.push(line_to_add);
      }
      for (let i = 0; i < SPACED_LINES; i++) {
        new_lines.push("");
      }
    }
  }
  get_custom_materials() {
    return new Map();
  }
  expand_shader(shader_string) {
    function parseIncludes(string) {
      var pattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
      function replace(match, include) {
        var replace2 = ShaderChunk2[include];
        if (replace2 === void 0) {
          throw new Error("Can not resolve #include <" + include + ">");
        }
        return parseIncludes(replace2);
      }
      return string.replace(pattern, replace);
    }
    return parseIncludes(shader_string);
  }
}
