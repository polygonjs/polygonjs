import {LiteralConstructsController as LiteralConstructsController2} from "../LiteralConstructsController";
import {CoreAttribute} from "../../../core/geometry/Attribute";
import lodash_isString from "lodash/isString";
const NATIVE_MATH_METHODS = [
  "abs",
  "acos",
  "acosh",
  "asin",
  "asinh",
  "atan",
  "atan2",
  "atanh",
  "ceil",
  "cos",
  "cosh",
  "exp",
  "expm1",
  "floor",
  "log",
  "log1p",
  "log2",
  "log10",
  "max",
  "min",
  "pow",
  "round",
  "sign",
  "sin",
  "sinh",
  "sqrt",
  "tan",
  "tanh"
];
const NATIVE_ES6_MATH_METHODS = ["cbrt", "hypot", "log10", "trunc"];
const NATIVE_MATH_METHODS_RENAMED = {
  math_random: "random"
};
const CORE_MATH_METHODS = ["fit", "fit01", "fract", "deg2rad", "rad2deg", "rand", "clamp"];
import {Easing as Easing2} from "../../../core/math/Easing";
const EASING_METHODS = Object.keys(Easing2);
const CORE_STRING_METHODS = ["precision"];
const NATIVE_MATH_CONSTANTS = ["E", "LN2", "LN10", "LOG10E", "LOG2E", "PI", "SQRT1_2", "SQRT2"];
const DIRECT_EXPRESSION_FUNCTIONS = {};
NATIVE_MATH_METHODS.forEach((name) => {
  DIRECT_EXPRESSION_FUNCTIONS[name] = `Math.${name}`;
});
NATIVE_ES6_MATH_METHODS.forEach((name) => {
  DIRECT_EXPRESSION_FUNCTIONS[name] = `Math.${name}`;
});
Object.keys(NATIVE_MATH_METHODS_RENAMED).forEach((name) => {
  const remaped = NATIVE_MATH_METHODS_RENAMED[name];
  DIRECT_EXPRESSION_FUNCTIONS[name] = `Math.${remaped}`;
});
CORE_MATH_METHODS.forEach((name) => {
  DIRECT_EXPRESSION_FUNCTIONS[name] = `Core.Math.${name}`;
});
EASING_METHODS.forEach((name) => {
  DIRECT_EXPRESSION_FUNCTIONS[name] = `Core.Math.Easing.${name}`;
});
CORE_STRING_METHODS.forEach((name) => {
  DIRECT_EXPRESSION_FUNCTIONS[name] = `Core.String.${name}`;
});
const LITERAL_CONSTRUCT = {
  if: LiteralConstructsController2.if
};
const GLOBAL_CONSTANTS = {};
NATIVE_MATH_CONSTANTS.forEach((name) => {
  GLOBAL_CONSTANTS[name] = `Math.${name}`;
});
const QUOTE = "'";
const ARGUMENTS_SEPARATOR = ", ";
const ATTRIBUTE_PREFIX = "@";
import {VARIABLE_PREFIX} from "./_Base";
const PROPERTY_OFFSETS = {
  x: 0,
  y: 1,
  z: 2,
  w: 3,
  r: 0,
  g: 1,
  b: 2
};
import {BaseTraverser} from "./_Base";
import {AttributeRequirementsController as AttributeRequirementsController2} from "../AttributeRequirementsController";
import {CoreMath} from "../../../core/math/_Module";
import {CoreString} from "../../../core/String";
import {Poly as Poly2} from "../../Poly";
export class FunctionGenerator extends BaseTraverser {
  constructor(param) {
    super(param);
    this.param = param;
    this._attribute_requirements_controller = new AttributeRequirementsController2();
    this.methods = [];
    this.method_index = -1;
    this.method_dependencies = [];
    this.immutable_dependencies = [];
  }
  parse_tree(parsed_tree) {
    this.reset();
    if (parsed_tree.error_message == null) {
      try {
        this._attribute_requirements_controller.reset();
        if (parsed_tree.node) {
          const function_main_string = this.traverse_node(parsed_tree.node);
          if (function_main_string && !this.is_errored) {
            this.function_main_string = function_main_string;
          }
        } else {
          console.warn("no parsed_tree.node");
        }
      } catch (e) {
        console.warn(`error in expression for param ${this.param.full_path()}`);
        console.warn(e);
      }
      if (this.function_main_string) {
        try {
          this.function = new Function("Core", "param", "methods", "_set_error_from_error", `
					try {
						${this.function_body()}
					} catch(e) {
						_set_error_from_error(e)
						return null;
					}`);
        } catch (e) {
          console.warn(e);
          this.set_error("cannot generate function");
        }
      } else {
        this.set_error("cannot generate function body");
      }
    } else {
      this.set_error("cannot parse expression");
    }
  }
  reset() {
    super.reset();
    this.function_main_string = void 0;
    this.methods = [];
    this.method_index = -1;
    this.function = void 0;
    this.method_dependencies = [];
    this.immutable_dependencies = [];
  }
  function_body() {
    if (this.param.options.is_expression_for_entities) {
      return `
			const entities = param.expression_controller.entities;
			if(entities){
				return new Promise( async (resolve, reject)=>{
					let entity;
					const entity_callback = param.expression_controller.entity_callback;
					${this._attribute_requirements_controller.assign_attributes_lines()}
					if( ${this._attribute_requirements_controller.attribute_presence_check_line()} ){
						${this._attribute_requirements_controller.assign_arrays_lines()}
						for(let index=0; index < entities.length; index++){
							entity = entities[index];
							result = ${this.function_main_string};
							entity_callback(entity, result);
						}
						resolve()
					} else {
						const error = new Error('attribute not found')
						_set_error_from_error(error)
						reject(error)
					}
				})
			}
			return []`;
    } else {
      return `
			return new Promise( async (resolve, reject)=>{
				try {
					const value = ${this.function_main_string}
					resolve(value)
				} catch(e) {
					_set_error_from_error(e)
					reject()
				}
			})
			`;
    }
  }
  eval_allowed() {
    return this.function != null;
  }
  eval_function() {
    if (this.function) {
      this.clear_error();
      const Core = {
        Math: CoreMath,
        String: CoreString
      };
      const result = this.function(Core, this.param, this.methods, this._set_error_from_error_bound);
      return result;
    }
  }
  traverse_CallExpression(node) {
    const method_arguments = node.arguments.map((arg) => {
      return this.traverse_node(arg);
    });
    const callee = node.callee;
    const method_name = callee.name;
    if (method_name) {
      const literal_contruct = LITERAL_CONSTRUCT[method_name];
      if (literal_contruct) {
        return literal_contruct(method_arguments);
      }
      const arguments_joined = `${method_arguments.join(ARGUMENTS_SEPARATOR)}`;
      const direct_function_name = DIRECT_EXPRESSION_FUNCTIONS[method_name];
      if (direct_function_name) {
        return `${direct_function_name}(${arguments_joined})`;
      }
      const indirect_method = Poly2.instance().expressionsRegister.get_method(method_name);
      if (indirect_method) {
        const path_node = node.arguments[0];
        const function_string = `return ${method_arguments[0]}`;
        let path_argument_function;
        let path_argument = [];
        try {
          path_argument_function = new Function(function_string);
          path_argument = path_argument_function();
        } catch {
        }
        this._create_method_and_dependencies(method_name, path_argument, path_node);
        return `(await methods[${this.method_index}].process_arguments([${arguments_joined}]))`;
      }
    }
    this.set_error(`unknown method: ${method_name}`);
  }
  traverse_BinaryExpression(node) {
    return `(${this.traverse_node(node.left)} ${node.operator} ${this.traverse_node(node.right)})`;
  }
  traverse_LogicalExpression(node) {
    return `(${this.traverse_node(node.left)} ${node.operator} ${this.traverse_node(node.right)})`;
  }
  traverse_MemberExpression(node) {
    return `${this.traverse_node(node.object)}.${this.traverse_node(node.property)}`;
  }
  traverse_UnaryExpression(node) {
    if (node.operator === ATTRIBUTE_PREFIX) {
      let argument = node.argument;
      let attribute_name;
      let property;
      switch (argument.type) {
        case "Identifier": {
          const argument_identifier = argument;
          attribute_name = argument_identifier.name;
          break;
        }
        case "MemberExpression": {
          const argument_member_expression = argument;
          const attrib_node = argument_member_expression.object;
          const property_node = argument_member_expression.property;
          attribute_name = attrib_node.name;
          property = property_node.name;
          break;
        }
      }
      if (attribute_name) {
        attribute_name = CoreAttribute.remap_name(attribute_name);
        if (attribute_name == "ptnum") {
          return "((entity != null) ? entity.index : 0)";
        } else {
          const var_attribute_size = this._attribute_requirements_controller.var_attribute_size(attribute_name);
          const var_array = this._attribute_requirements_controller.var_array(attribute_name);
          this._attribute_requirements_controller.add(attribute_name);
          if (property) {
            const property_offset = PROPERTY_OFFSETS[property];
            return `${var_array}[entity.index*${var_attribute_size}+${property_offset}]`;
          } else {
            return `${var_array}[entity.index*${var_attribute_size}]`;
          }
        }
      } else {
        console.warn("attribute not found");
        return "";
      }
    } else {
      return `${node.operator}${this.traverse_node(node.argument)}`;
    }
  }
  traverse_Literal(node) {
    return `${node.raw}`;
  }
  traverse_Identifier(node) {
    const identifier_first_char = node.name[0];
    if (identifier_first_char == VARIABLE_PREFIX) {
      const identifier_name_without_dollar_sign = node.name.substr(1);
      const direct_constant_name = GLOBAL_CONSTANTS[identifier_name_without_dollar_sign];
      if (direct_constant_name) {
        return direct_constant_name;
      }
      const method_name = `traverse_Identifier_${identifier_name_without_dollar_sign}`;
      const method = this[method_name];
      if (method) {
        return this[method_name]();
      } else {
        this.set_error(`identifier unknown: ${node.name}`);
      }
    } else {
      return node.name;
    }
  }
  traverse_Identifier_F() {
    this.immutable_dependencies.push(this.param.scene.time_controller.graph_node);
    return `param.scene.time_controller.frame`;
  }
  traverse_Identifier_FPS() {
    this.immutable_dependencies.push(this.param.scene.time_controller.graph_node);
    return `param.scene.time_controller.fps`;
  }
  traverse_Identifier_T() {
    this.immutable_dependencies.push(this.param.scene.time_controller.graph_node);
    return `param.scene.time_controller.time`;
  }
  traverse_Identifier_CH() {
    return `${QUOTE}${this.param.name}${QUOTE}`;
  }
  traverse_Identifier_CEX() {
    return this._method_centroid("x");
  }
  traverse_Identifier_CEY() {
    return this._method_centroid("y");
  }
  traverse_Identifier_CEZ() {
    return this._method_centroid("z");
  }
  _method_centroid(component) {
    const method_arguments = [0, `${QUOTE}${component}${QUOTE}`];
    const arguments_joined = method_arguments.join(ARGUMENTS_SEPARATOR);
    this._create_method_and_dependencies("centroid", 0);
    return `(await methods[${this.method_index}].process_arguments([${arguments_joined}]))`;
  }
  _create_method_and_dependencies(method_name, path_argument, path_node) {
    const method_constructor = Poly2.instance().expressionsRegister.get_method(method_name);
    if (!method_constructor) {
      this.set_error(`method not found (${method_name})`);
      return;
    }
    const method = new method_constructor(this.param);
    this.method_index += 1;
    this.methods[this.method_index] = method;
    if (method.require_dependency()) {
      const method_dependency = method.find_dependency(path_argument);
      if (method_dependency) {
        if (path_node) {
          method_dependency.set_jsep_node(path_node);
        }
        this.method_dependencies.push(method_dependency);
      } else {
        if (path_node && lodash_isString(path_argument)) {
          this.param.scene.missing_expression_references_controller.register(this.param, path_node, path_argument);
        }
      }
    }
  }
}
