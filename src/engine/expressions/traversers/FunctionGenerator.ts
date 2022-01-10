/**
 * The following expressions are available to use in most parameters:
 *
 * ## Variables
 *
 * - `$F`: current frame
 * - `$T`: current time
 * - `$OS`: current node name
 * - `$CH`: current param name
 * - `$CEX`: input centroid x component
 * - `$CEY`: input centroid y component
 * - `$CEZ`: input centroid z component
 *
 * Those variables are aliases to the javascript math module:
 *
 * - `$E`
 * - `$LN2`
 * - `$LN10`
 * - `$LOG10E`
 * - `$LOG2E`
 * - `$PI`
 * - `$SQRT1_2`
 * - `$SQRT2`
 *
 * In some parameters which can evaluate per entity (which means per point or per object),
 * it is also possible to use variables to access attributes:
 *
 * - `@ptnum` will evaluate to the current point index
 * - `@objnum` will evaluate to the current object index
 * - And you can also refer to any existing attribute, **using @ following by the attribute name**.
 *
 * For instance:
 *
 * - `@P.x` evaluates to the **x** component of the position.
 * - `@P.y` evaluates to the **y** component of the position.
 * - `@P.z` evaluates to the **z** component of the position.
 * - `@N.x` evaluates to the **x** component of the normal.
 * - `@N.y` evaluates to the **y** component of the normal.
 * - `@N.z` evaluates to the **z** component of the normal.
 * - `@Cd.x` evaluates to the **x** component of the color.
 * - `@Cd.y` evaluates to the **y** component of the color.
 * - `@Cd.z` evaluates to the **z** component of the color.
 * - `@uv.x` evaluates to the **x** component of the uv.
 * - `@uv.y` evaluates to the **y** component of the uv.
 *
 * Using the attribCreate, point or normal SOPs, you can mix and match them.
 * For instance, if in the point SOP, you set to the x component `@uv.x` and y component `@uv.y`
 * then the points will be transformed to look like in UV space.
 *
 * Another common setup is to use an attribute create to add an attribute `id`, with `@ptnum`.
 * This way, every point will have a unique id.
 * You can then use this id in the following nodes, or even in a material.
 *
 * Instead of having an attribute id that goes from 0 to the number of points in your geometry,
 * you can also create one that goes from 0 to 1, using `@ptnum / (pointsCount(0)-1)`
 *
 *
 * ## Math expressions
 *
 * The following are native javascript functions:
 *
 * - abs
 * - acos
 * - acosh
 * - asin
 * - asinh
 * - atan
 * - atan2
 * - atanh
 * - ceil
 * - cos
 * - cosh
 * - exp
 * - expm1
 * - floor
 * - log
 * - log1p
 * - log2
 * - log10
 * - max
 * - min
 * - pow
 * - random (which aliases to Math.rand())
 * - round
 * - sign
 * - sin
 * - sinh
 * - sqrt
 * - tan
 * - tanh
 *
 * If you are targetting ES6 (available in modern browsers), you can also have:
 *
 * - cbrt
 * - hypot
 * - log10
 * - trunc
 *
 * The following are aliases from the [Polygonjs CoreMath](https://github.com/polygonjs/polygonjs-engine/blob/master/src/core/math/_Module.ts) module:
 *
 * - fit
 * - fit01
 * - fract
 * - deg2rad
 * - rad2deg
 * - rand
 * - clamp
 *
 * And the following are alias to the [Polygonjs Easing](https://github.com/polygonjs/polygonjs-engine/blob/master/src/core/math/Easing.ts) module:
 *
 * - linear
 * - ease_i
 * - ease_o
 * - ease_io
 * - ease_i2
 * - ease_o2
 * - ease_io2
 * - ease_i3
 * - ease_o3
 * - ease_io3
 * - ease_i4
 * - ease_o4
 * - ease_io4
 * - ease_i_sin
 * - ease_o_sin
 * - ease_io_sin
 * - ease_i_elastic
 * - ease_o_elastic
 * - ease_io_elastic
 *
 *
 * ## String expressions:
 *
 * - precision (alias to the [CoreString](https://github.com/polygonjs/polygonjs-engine/blob/master/src/core/String.ts) module precision method)
 * - [strCharsCount](/docs/expressions/strCharsCount)
 * - [strConcat](/docs/expressions/strConcat)
 * - [strIndex](/docs/expressions/strIndex)
 * - [strSub](/docs/expressions/strSub)
 *
 *  */

import {BaseParamType} from '../../params/_Base';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {ParsedTree} from './ParsedTree';
import {LiteralConstructsController, LiteralConstructMethod} from '../LiteralConstructsController';
import {BaseMethod} from '../methods/_Base';
import {Attribute, CoreAttribute} from '../../../core/geometry/Attribute';
import {BaseTraverser} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {AttributeRequirementsController} from '../AttributeRequirementsController';
import {CoreMath} from '../../../core/math/_Module';
import {CoreString} from '../../../core/String';
import {Poly} from '../../Poly';
import {CoreType} from '../../../core/Type';
import {PolyDictionary} from '../../../types/GlobalTypes';
// import {JsepsByString} from '../DependenciesController'
import jsep from 'jsep';

// import {Vector3} from 'three/src/math/Vector3'
type LiteralConstructDictionary = PolyDictionary<LiteralConstructMethod>;
type AnyDictionary = PolyDictionary<any>;

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

const GLOBAL_CONSTANTS: PolyDictionary<string> = {};
NATIVE_MATH_CONSTANTS.forEach((name) => {
	GLOBAL_CONSTANTS[name] = `Math.${name}`;
});

const QUOTE = "'";
const ARGUMENTS_SEPARATOR = ', ';
const ATTRIBUTE_PREFIX = '@';
import {VARIABLE_PREFIX} from './_Base';
import {CorePoint} from '../../../core/geometry/Point';

const PROPERTY_OFFSETS: AnyDictionary = {
	x: 0,
	y: 1,
	z: 2,
	w: 3,
	r: 0,
	g: 1,
	b: 2,
};

type MethodArgumentFunction = () => string | number;
const Core = {
	Math: CoreMath,
	String: CoreString,
};

export class FunctionGenerator extends BaseTraverser {
	private function: Function | undefined;
	private _attribute_requirements_controller = new AttributeRequirementsController();
	private function_main_string: string | undefined;
	private methods: BaseMethod[] = [];
	private method_index: number = -1;

	public methodDependencies: MethodDependency[] = [];
	public immutableDependencies: CoreGraphNode[] = [];
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
				this._attribute_requirements_controller = new AttributeRequirementsController();
				// this.function_pre_body = ''
				if (parsed_tree.node) {
					const function_main_string = this.traverse_node(parsed_tree.node);
					if (function_main_string && !this.is_errored()) {
						this.function_main_string = function_main_string;
					}
				} else {
					console.warn('no parsed_tree.node');
				}
			} catch (e) {
				console.warn(`error in expression for param ${this.param.path()}`);
				console.warn(e);
			}

			if (this.function_main_string) {
				try {
					const body = this._functionBody();
					// not sure why I needed AsyncFunction
					this.function = new Function(
						'CorePoint',
						'Core',
						'param',
						'methods',
						'_set_error_from_error',
						`
					try {
						${body}
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
		this.methodDependencies = [];
		this.immutableDependencies = [];
	}

	private _functionBody() {
		if (this.param.options.isExpressionForEntities()) {
			return `
			const entities = param.expressionController.entities();
			function getEntitiesAttribute(entities, attribName){
				const firstEntity = entities[0];
				if(firstEntity instanceof CorePoint){
					return firstEntity.geometry().attributes[attribName];
				} else {
					return entities.map(e=>e.attribValue(attribName));
				}
			}
			function getCorePointAttribValue(entity, attribName, array, attributeSize, propertyOffset){
				return array[entity.index()*attributeSize+propertyOffset];
			}
			function getCoreObjectAttribValue(entity, attribName, array, attributeSize, propertyOffset){
				return entity.attribValue(attribName)
			}
			if(entities){
				return new Promise( async (resolve, reject)=>{
					let entity;
					const entityCallback = param.expressionController.entityCallback();
					// assign_attributes_lines
					${this._attribute_requirements_controller.assignAttributesLines()}
					// check if attributes are present
					if( ${this._attribute_requirements_controller.attributePresenceCheckLine()} ){
						// assign function
						const getEntityAttribValue = (entities[0] instanceof CorePoint) ? getCorePointAttribValue : getCoreObjectAttribValue;
						// assign_arrays_lines
						${this._attribute_requirements_controller.assignArraysLines()}
						for(let index=0; index < entities.length; index++){
							entity = entities[index];
							result = ${this.function_main_string};
							entityCallback(entity, result);
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

	evalAllowed(): boolean {
		return this.function != null;
	}
	evalFunction() {
		// this.param.entity_attrib_values = this.param.entity_attrib_values || {}
		// this.param.entity_attrib_values.position =
		// 	this.param.entity_attrib_values.position || new THREE.Vector3()
		if (this.function) {
			this.clear_error();

			const result = this.function(CorePoint, Core, this.param, this.methods, this._set_error_from_error_bound);
			return result;
		}
	}

	//
	//
	// TRAVERSE METHODS
	//
	//
	protected traverse_CallExpression(node: jsep.CallExpression): string | undefined {
		const methodArguments = node.arguments.map((arg) => {
			return this.traverse_node(arg);
		});
		const callee = node.callee as jsep.Identifier;
		const method_name = callee.name;
		if (method_name) {
			// literal construct (if...)
			const literal_contruct = LITERAL_CONSTRUCT[method_name];
			if (literal_contruct) {
				return literal_contruct(methodArguments);
			}

			// direct expressions (Math.floor, Math.sin...)
			const arguments_joined = `${methodArguments.join(ARGUMENTS_SEPARATOR)}`;
			const direct_function_name = DIRECT_EXPRESSION_FUNCTIONS[method_name];
			if (direct_function_name) {
				return `${direct_function_name}(${arguments_joined})`;
			}

			// indirect methods (pointsCount, asset...)
			const expressionRegister = Poly.expressionsRegister;
			const indirect_method = expressionRegister.getMethod(method_name);
			if (indirect_method) {
				const pathNode = node.arguments[0];
				// const path_argument = this.string_generator.traverse_node(path_node)
				const functionString = `return ${methodArguments[0]}`;
				let pathArgumentFunction: MethodArgumentFunction | undefined;
				let pathArgument: string | number | undefined;
				try {
					pathArgumentFunction = new Function(functionString) as MethodArgumentFunction;
					pathArgument = pathArgumentFunction();
				} catch {
					// path_argument_function = new AsyncFunction(function_string)
					// it looks like if the input contains an await,
					// it is because it has been generated by another indirect function.
					// This means that the dependencies have been generated already
					// so we may not need to do it now
				}
				this._createMethodAndDependencies(method_name, pathArgument, pathNode);

				return `(await methods[${this.method_index}].processArguments([${arguments_joined}]))`;
			} else {
				const available_methods = expressionRegister.availableMethods().join(', ');
				const message = `method not found (${method_name}), available methods are: ${available_methods}`;
				Poly.warn(message);
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
			let attributeName: string | undefined;
			let property;
			switch (argument.type) {
				case 'Identifier': {
					const argument_identifier = (<unknown>argument) as jsep.Identifier;
					attributeName = argument_identifier.name;
					break;
				}
				case 'MemberExpression': {
					const argument_member_expression = (<unknown>argument) as jsep.MemberExpression;
					const attrib_node = argument_member_expression.object as jsep.Identifier;
					const property_node = argument_member_expression.property as jsep.Identifier;
					attributeName = attrib_node.name;
					property = property_node.name;
					break;
				}
			}
			// this.function_pre_body += `
			// param.entity_attrib_value(${QUOTE}${attrib_node.name}${QUOTE}, param.entity_attrib_values.position);
			// `
			if (attributeName) {
				attributeName = CoreAttribute.remapName(attributeName);
				if (attributeName == Attribute.POINT_INDEX || attributeName == Attribute.OBJECT_INDEX) {
					return '((entity != null) ? entity.index() : 0)';
				} else {
					const var_attribute_size = this._attribute_requirements_controller.varAttributeSize(attributeName);
					const var_array = this._attribute_requirements_controller.varArray(attributeName);
					this._attribute_requirements_controller.add(attributeName);
					let propertyOffset = property ? PROPERTY_OFFSETS[property] : 0;
					if (propertyOffset == null) {
						propertyOffset = 0;
					}
					// if (property) {
					// 	const property_offset = PROPERTY_OFFSETS[property];
					// 	return `${var_array}[entity.index()*${var_attribute_size}+${property_offset}]`;
					// } else {
					// 	return `${var_array}[entity.index()*${var_attribute_size}]`;
					// }
					return `getEntityAttribValue(entity, '${attributeName}', ${var_array}, ${var_attribute_size}, ${propertyOffset})`;
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

			// scene or node globals: $F, $T, $OS, $CH, $OS
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
		this.immutableDependencies.push(this.param.scene().timeController.graphNode);
		return `param.scene().timeController.frame()`;
	}
	// protected traverse_Identifier_FPS(): string {
	// 	this.immutable_dependencies.push(this.param.scene().timeController.graphNode);
	// 	return `param.scene().timeController.fps`;
	// }
	protected traverse_Identifier_T(): string {
		this.immutableDependencies.push(this.param.scene().timeController.graphNode);
		return `param.scene().timeController.time()`;
	}
	protected traverse_Identifier_OS(): string {
		return `${QUOTE}${this.param.node.name()}${QUOTE}`;
	}
	protected traverse_Identifier_CH(): string {
		return `${QUOTE}${this.param.name()}${QUOTE}`;
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
		this._createMethodAndDependencies('centroid', 0);
		return `(await methods[${this.method_index}].processArguments([${arguments_joined}]))`;
	}

	//
	//
	// Methods dependencies
	//
	//
	private _createMethodAndDependencies(
		methodName: string,
		pathArgument: number | string | undefined,
		pathNode?: jsep.Expression
	) {
		const expressionRegister = Poly.expressionsRegister;
		const methodConstructor = expressionRegister.getMethod(methodName);
		if (!methodConstructor) {
			const availableMethods = expressionRegister.availableMethods();
			const message = `method not found (${methodName}), available methods are: ${availableMethods.join(', ')}`;
			this.set_error(message);
			Poly.warn(message);
			return;
		}
		const method = new methodConstructor(this.param) as BaseMethod;
		this.method_index += 1;
		this.methods[this.method_index] = method;

		if (method.requireDependency() && pathArgument != null) {
			const methodDependency = method.findDependency(pathArgument);
			if (methodDependency) {
				if (pathNode) {
					methodDependency.set_jsep_node(pathNode);
				}
				this.methodDependencies.push(methodDependency);
			} else {
				if (pathNode && CoreType.isString(pathArgument)) {
					this.param.scene().missingExpressionReferencesController.register(this.param, pathArgument);
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
