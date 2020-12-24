import {BaseParamType} from '../../params/_Base';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {ParsedTree} from './ParsedTree';
import {LiteralConstructsController, LiteralConstructMethod} from '../LiteralConstructsController';
import {BaseMethod} from '../methods/_Base';
import {CoreAttribute} from '../../../core/geometry/Attribute';

// import {JsepsByString} from '../DependenciesController'
import jsep from 'jsep';

// import {Vector3} from 'three/src/math/Vector3'
type LiteralConstructDictionary = Dictionary<LiteralConstructMethod>;
type AnyDictionary = Dictionary<any>;

const NATIVE_MATH_METHODS = [
	'abs',
	'acos',
	'acosh',
	'asin',
	'asinh',
	'atan',
	'atan2',
	'atanh',
	'ceil',
	'cos',
	'cosh',
	'exp',
	'expm1',
	'floor',
	'log',
	'log1p',
	'log2',
	'log10',
	'max',
	'min',
	'pow',
	'round',
	'sign',
	'sin',
	'sinh',
	'sqrt',
	'tan',
	'tanh',
];
const NATIVE_ES6_MATH_METHODS = ['cbrt', 'hypot', 'log10', 'trunc'];
const NATIVE_MATH_METHODS_RENAMED: AnyDictionary = {
	math_random: 'random',
};
const CORE_MATH_METHODS = ['fit', 'fit01', 'fract', 'deg2rad', 'rad2deg', 'rand', 'clamp'];
import {Easing} from '../../../core/math/Easing';
const EASING_METHODS = Object.keys(Easing);

const CORE_STRING_METHODS = ['precision'];
const NATIVE_MATH_CONSTANTS = ['E', 'LN2', 'LN10', 'LOG10E', 'LOG2E', 'PI', 'SQRT1_2', 'SQRT2'];

const DIRECT_EXPRESSION_FUNCTIONS: AnyDictionary = {};
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

const LITERAL_CONSTRUCT: LiteralConstructDictionary = {
	if: LiteralConstructsController.if,
};

const GLOBAL_CONSTANTS: Dictionary<string> = {};
NATIVE_MATH_CONSTANTS.forEach((name) => {
	GLOBAL_CONSTANTS[name] = `Math.${name}`;
});

const QUOTE = "'";
const ARGUMENTS_SEPARATOR = ', ';
const ATTRIBUTE_PREFIX = '@';
import {VARIABLE_PREFIX} from './_Base';

const PROPERTY_OFFSETS: AnyDictionary = {
	x: 0,
	y: 1,
	z: 2,
	w: 3,
	r: 0,
	g: 1,
	b: 2,
};

import {BaseTraverser} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {AttributeRequirementsController} from '../AttributeRequirementsController';
import {CoreMath} from '../../../core/math/_Module';
import {CoreString} from '../../../core/String';

// import {AsyncFunction} from '../../../core/AsyncFunction';
import {Poly} from '../../Poly';
import { CoreType } from '../../../core/Type';

export class FunctionGenerator extends BaseTraverser {
	private function: Function | undefined;
	private _attribute_requirements_controller = new AttributeRequirementsController();
	private function_main_string: string | undefined;
	private methods: BaseMethod[] = [];
	private method_index: number = -1;

	public method_dependencies: MethodDependency[] = [];
	public immutable_dependencies: CoreGraphNode[] = [];
	// public jsep_dependencies: JsepDependency[] = []
	// public jsep_nodes_by_missing_paths: JsepsByString = {}

	// private string_generator: ExpressionStringGenerator = new ExpressionStringGenerator()

	constructor(public param: BaseParamType) {
		super(param);
	}

	public parse_tree(parsed_tree: ParsedTree) {
		this.reset();

		if (parsed_tree.error_message == null) {
			try {
				// this.function_pre_entities_loop_lines = [];
				this._attribute_requirements_controller.reset();
				// this.function_pre_body = ''
				if (parsed_tree.node) {
					const function_main_string = this.traverse_node(parsed_tree.node);
					if (function_main_string && !this.is_errored) {
						this.function_main_string = function_main_string;
					}
				} else {
					console.warn('no parsed_tree.node');
				}
			} catch (e) {
				console.warn(`error in expression for param ${this.param.full_path()}`);
				console.warn(e);
			}

			if (this.function_main_string) {
				try {
					// not sure why I needed AsyncFunction
					this.function = new Function(
						'Core',
						'param',
						'methods',
						'_set_error_from_error',
						`
					try {
						${this.function_body()}
					} catch(e) {
						_set_error_from_error(e)
						return null;
					}`
					);
				} catch (e) {
					console.warn(e);
					this.set_error('cannot generate function');
				}
			} else {
				this.set_error('cannot generate function body');
			}
		} else {
			this.set_error('cannot parse expression');
		}
	}

	reset() {
		super.reset();
		this.function_main_string = undefined;
		this.methods = [];
		this.method_index = -1;
		this.function = undefined;
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

	eval_allowed(): boolean {
		return this.function != null;
	}
	eval_function() {
		// this.param.entity_attrib_values = this.param.entity_attrib_values || {}
		// this.param.entity_attrib_values.position =
		// 	this.param.entity_attrib_values.position || new THREE.Vector3()
		if (this.function) {
			this.clear_error();

			const Core = {
				Math: CoreMath,
				String: CoreString,
			};
			const result = this.function(Core, this.param, this.methods, this._set_error_from_error_bound);
			return result;
		}
	}

	//
	//
	// TRAVERSE METHODS
	//
	//
	protected traverse_CallExpression(node: jsep.CallExpression): string | undefined {
		const method_arguments = node.arguments.map((arg) => {
			return this.traverse_node(arg);
		});
		const callee = node.callee as jsep.Identifier;
		const method_name = callee.name;
		if (method_name) {
			// literal construct (if...)
			const literal_contruct = LITERAL_CONSTRUCT[method_name];
			if (literal_contruct) {
				return literal_contruct(method_arguments);
			}

			// direct expressions (Math.floor, Math.sin...)
			const arguments_joined = `${method_arguments.join(ARGUMENTS_SEPARATOR)}`;
			const direct_function_name = DIRECT_EXPRESSION_FUNCTIONS[method_name];
			if (direct_function_name) {
				return `${direct_function_name}(${arguments_joined})`;
			}

			// indirect methods (points_count, asset...)
			const indirect_method = Poly.instance().expressionsRegister.get_method(method_name);
			if (indirect_method) {
				const path_node = node.arguments[0];
				// const path_argument = this.string_generator.traverse_node(path_node)
				const function_string = `return ${method_arguments[0]}`;
				let path_argument_function;
				let path_argument = [];
				try {
					path_argument_function = new Function(function_string);
					path_argument = path_argument_function();
				} catch {
					// path_argument_function = new AsyncFunction(function_string)
					// it looks like if the input contains an await,
					// it is because it has been generated by another indirect function.
					// This means that the dependencies have been generated already
					// so we may not need to do it now
				}

				this._create_method_and_dependencies(method_name, path_argument, path_node);
				return `(await methods[${this.method_index}].process_arguments([${arguments_joined}]))`;
			}
		}

		this.set_error(`unknown method: ${method_name}`);
	}
	protected traverse_BinaryExpression(node: jsep.BinaryExpression): string {
		// if(node.right.type == 'Identifier'){
		// 	this.set_error(`cannot have identifier after ${node.operator}`)
		// 	return ""
		// }
		return `(${this.traverse_node(node.left)} ${node.operator} ${this.traverse_node(node.right)})`;
	}
	protected traverse_LogicalExpression(node: jsep.LogicalExpression): string {
		// || or &&
		// if(node.right.type == 'Identifier'){
		// 	this.set_error(`cannot have identifier after ${node.operator}`)
		// 	return ""
		// }
		return `(${this.traverse_node(node.left)} ${node.operator} ${this.traverse_node(node.right)})`;
	}
	protected traverse_MemberExpression(node: jsep.MemberExpression): string {
		return `${this.traverse_node(node.object)}.${this.traverse_node(node.property)}`;
	}
	protected traverse_UnaryExpression(node: jsep.UnaryExpression): string {
		if (node.operator === ATTRIBUTE_PREFIX) {
			let argument = node.argument;
			let attribute_name;
			let property;
			switch (argument.type) {
				case 'Identifier': {
					const argument_identifier = (<unknown>argument) as jsep.Identifier;
					attribute_name = argument_identifier.name;
					break;
				}
				case 'MemberExpression': {
					const argument_member_expression = (<unknown>argument) as jsep.MemberExpression;
					const attrib_node = argument_member_expression.object as jsep.Identifier;
					const property_node = argument_member_expression.property as jsep.Identifier;
					attribute_name = attrib_node.name;
					property = property_node.name;
					break;
				}
			}
			// this.function_pre_body += `
			// param.entity_attrib_value(${QUOTE}${attrib_node.name}${QUOTE}, param.entity_attrib_values.position);
			// `
			if (attribute_name) {
				attribute_name = CoreAttribute.remap_name(attribute_name);
				if (attribute_name == 'ptnum') {
					return '((entity != null) ? entity.index : 0)';
				} else {
					const var_attribute_size = this._attribute_requirements_controller.var_attribute_size(
						attribute_name
					);
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
				console.warn('attribute not found');
				return '';
			}
		} else {
			return `${node.operator}${this.traverse_node(node.argument)}`; // -5
		}
	}

	protected traverse_Literal(node: jsep.Literal): string {
		return `${node.raw}`; // 5 or 'string' (raw will include quotes)
	}

	protected traverse_Identifier(node: jsep.Identifier): string | undefined {
		const identifier_first_char = node.name[0];
		if (identifier_first_char == VARIABLE_PREFIX) {
			const identifier_name_without_dollar_sign = node.name.substr(1);

			// globals constants: Math.PI or Math.E
			const direct_constant_name = GLOBAL_CONSTANTS[identifier_name_without_dollar_sign];
			if (direct_constant_name) {
				return direct_constant_name;
			}

			// scene or node globals: $F, $FPS, $T, $CH, $OS
			const method_name = `traverse_Identifier_${identifier_name_without_dollar_sign}`;
			const method = (this as any)[method_name];
			if (method) {
				return (this as any)[method_name]();
			} else {
				this.set_error(`identifier unknown: ${node.name}`);
			}
		} else {
			return node.name; // @ptnum will call this method and return "ptnum"
		}
	}

	//
	//
	// Identifier methods (called from Identifier_body)
	//
	//
	protected traverse_Identifier_F(): string {
		this.immutable_dependencies.push(this.param.scene.time_controller.graph_node);
		return `param.scene.time_controller.frame`;
	}
	protected traverse_Identifier_FPS(): string {
		this.immutable_dependencies.push(this.param.scene.time_controller.graph_node);
		return `param.scene.time_controller.fps`;
	}
	protected traverse_Identifier_T(): string {
		this.immutable_dependencies.push(this.param.scene.time_controller.graph_node);
		return `param.scene.time_controller.time`;
	}
	protected traverse_Identifier_CH(): string {
		return `${QUOTE}${this.param.name}${QUOTE}`;
	}
	protected traverse_Identifier_CEX(): string {
		return this._method_centroid('x');
	}
	protected traverse_Identifier_CEY(): string {
		return this._method_centroid('y');
	}
	protected traverse_Identifier_CEZ(): string {
		return this._method_centroid('z');
	}
	// TODO:
	// '$OS': '_eval_identifier_as_node_name',
	// '$BBX': '_eval_identifier_as_bounding_box_relative',

	private _method_centroid(component: string): string {
		const method_arguments = [0, `${QUOTE}${component}${QUOTE}`];
		const arguments_joined = method_arguments.join(ARGUMENTS_SEPARATOR);
		this._create_method_and_dependencies('centroid', 0);
		return `(await methods[${this.method_index}].process_arguments([${arguments_joined}]))`;
	}

	//
	//
	// Methods dependencies
	//
	//
	private _create_method_and_dependencies(
		method_name: string,
		path_argument: number | string,
		path_node?: jsep.Expression
	) {
		const method_constructor = Poly.instance().expressionsRegister.get_method(method_name);
		if (!method_constructor) {
			this.set_error(`method not found (${method_name})`);
			return;
		}
		const method = new method_constructor(this.param) as BaseMethod;
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
				if (path_node && CoreType.isString(path_argument)) {
					this.param.scene.missing_expression_references_controller.register(
						this.param,
						path_node,
						path_argument
					);
				}
			}
		}
		// method_dependencies.resolved_graph_nodes.forEach((graph_node)=>{
		// 	if(path_node){
		// 		const jsep_dependency = new JsepDependency(graph_node, path_node)
		// 		this.jsep_dependencies.push(jsep_dependency)
		// 	} else {
		// 		this.immutable_dependencies.push(graph_node)
		// 	}

		// })

		// if(path_node){
		// 	reference_search_result.missing_paths.forEach((path)=>{
		// 		this.jsep_nodes_by_missing_paths[path] = this.jsep_nodes_by_missing_paths[path] || []
		// 		this.jsep_nodes_by_missing_paths[path].push(path_node)
		// 	})
		// }
	}
}
