import {GlobalsBaseController} from "./_Base";
import {AttributeGlNode} from "../../Attribute";
import {VaryingGLDefinition, AttributeGLDefinition} from "../../utils/GLDefinition";
import {MapUtils as MapUtils2} from "../../../../../core/MapUtils";
import {ShaderName as ShaderName2} from "../../../utils/shaders/ShaderName";
const VARIABLE_CONFIG_DEFAULT_BY_NAME = {
  position: "vec3( position )"
};
const GlobalsGeometryHandler2 = class extends GlobalsBaseController {
  handle_globals_node(globals_node, output_name, shaders_collection_controller) {
    const connection_point = globals_node.io.outputs.named_output_connection_points_by_name(output_name);
    if (!connection_point) {
      return;
    }
    const var_name = globals_node.gl_var_name(output_name);
    const gl_type = connection_point.type;
    const definition = new VaryingGLDefinition(globals_node, gl_type, var_name);
    shaders_collection_controller.add_definitions(globals_node, [definition]);
    const assembler = globals_node.material_node?.assembler_controller?.assembler;
    if (!assembler) {
      return;
    }
    const shader_config = assembler.shader_config(shaders_collection_controller.current_shader_name);
    if (!shader_config) {
      return;
    }
    const dependencies = shader_config.dependencies();
    const body_line = `${var_name} = ${gl_type}(${output_name})`;
    for (let dependency of dependencies) {
      shaders_collection_controller.add_definitions(globals_node, [definition], dependency);
      shaders_collection_controller.add_body_lines(globals_node, [body_line], dependency);
    }
    if (dependencies.length == 0) {
      shaders_collection_controller.add_body_lines(globals_node, [body_line]);
    }
  }
  static variable_config_default(variable_name) {
    return VARIABLE_CONFIG_DEFAULT_BY_NAME[variable_name];
  }
  variable_config_default(variable_name) {
    return GlobalsGeometryHandler2.variable_config_default(variable_name);
  }
  read_attribute(node, gl_type, attrib_name, shaders_collection_controller) {
    return GlobalsGeometryHandler2.read_attribute(node, gl_type, attrib_name, shaders_collection_controller);
  }
  static read_attribute(node, gl_type, attrib_name, shaders_collection_controller) {
    if (GlobalsGeometryHandler2.PRE_DEFINED_ATTRIBUTES.indexOf(attrib_name) < 0) {
      shaders_collection_controller.add_definitions(node, [new AttributeGLDefinition(node, gl_type, attrib_name)], ShaderName2.VERTEX);
    } else {
    }
    const shader_name = shaders_collection_controller.current_shader_name;
    switch (shader_name) {
      case ShaderName2.VERTEX: {
        return attrib_name;
      }
      case ShaderName2.FRAGMENT: {
        if (!(node instanceof AttributeGlNode)) {
          return;
        }
        const var_name = "varying_" + node.gl_var_name(node.output_name);
        const varying_definition = new VaryingGLDefinition(node, gl_type, var_name);
        const definitions_by_shader_name = new Map();
        definitions_by_shader_name.set(ShaderName2.FRAGMENT, []);
        const body_lines_by_shader_name = new Map();
        body_lines_by_shader_name.set(ShaderName2.FRAGMENT, []);
        MapUtils2.push_on_array_at_entry(definitions_by_shader_name, shader_name, varying_definition);
        const set_varying_body_line = `${var_name} = ${gl_type}(${attrib_name})`;
        const shader_config = node.material_node?.assembler_controller?.assembler.shader_config(shader_name);
        if (shader_config) {
          const dependencies = shader_config.dependencies();
          for (let dependency of dependencies) {
            MapUtils2.push_on_array_at_entry(definitions_by_shader_name, dependency, varying_definition);
            MapUtils2.push_on_array_at_entry(body_lines_by_shader_name, dependency, set_varying_body_line);
          }
          definitions_by_shader_name.forEach((definitions, shader_name2) => {
            shaders_collection_controller.add_definitions(node, definitions, shader_name2);
          });
          body_lines_by_shader_name.forEach((body_lines, shader_name2) => {
            shaders_collection_controller.add_body_lines(node, body_lines, shader_name2);
          });
        }
        return var_name;
      }
    }
  }
  handle_attribute_node(node, gl_type, attrib_name, shaders_collection_controller) {
    return GlobalsGeometryHandler2.read_attribute(node, gl_type, attrib_name, shaders_collection_controller);
  }
};
export let GlobalsGeometryHandler = GlobalsGeometryHandler2;
GlobalsGeometryHandler.PRE_DEFINED_ATTRIBUTES = [
  "position",
  "color",
  "normal",
  "uv",
  "uv2",
  "morphTarget0",
  "morphTarget1",
  "morphTarget2",
  "morphTarget3",
  "skinIndex",
  "skinWeight"
];
GlobalsGeometryHandler.IF_RULE = {
  uv: "defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )"
};
