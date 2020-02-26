import {BaseParamType} from '../../params/_Base';
// import {ParsedTree} from './ParsedTree'
// import {LiteralConstructsController} from './LiteralConstructsController'
import jsep from 'jsep';
// import {BaseMethod} from '../../../Engine/Expression/Method/_Base'
// import {ReferenceSearchResult, MissingExpressionReference} from './MissingReference'
// import {MissingReferencesController} from './MissingReferencesController'
export const VARIABLE_PREFIX = '$';

export abstract class BaseTraverser {
	// private _parsed_tree: ParsedTree
	public error_message: string | undefined;

	constructor(public param: BaseParamType) {}

	protected set_error(message: string) {
		this.error_message = this.error_message || message;
		// throw this.error_message
	}

	traverse_node(node: jsep.Expression): string | undefined {
		const method_name = `traverse_${node.type}`;
		const method = (this as any)[method_name];
		if (method) {
			return (this as any)[method_name](node);
		} else {
			this.set_error(`expression unknown node type: ${node.type}`);
		}
	}

	protected abstract traverse_CallExpression(node: jsep.CallExpression): string | undefined; //{

	// const method_arguments = node.arguments.map((arg)=>{
	// 	return this.traverse_node(arg)
	// })
	// const method_name = node.callee.name

	// // literal construct (if...)
	// const literal_contruct = this[`traverse_literal_construct_${node.type}`] //LITERAL_CONSTRUCT[method_name]
	// if(literal_contruct){
	// 	return literal_contruct.bind(this)(method_arguments)
	// }

	// // direct expressions (Math.floor, Math.sin...)
	// const arguments_joined = `${method_arguments.join(ARGUMENTS_SEPARATOR)}`
	// const direct_function_name = DIRECT_EXPRESSION_FUNCTIONS[method_name]
	// if(direct_function_name){
	// 	return `${direct_function_name}(${arguments_joined})`
	// }

	// // indirect methods (points_count, asset...)
	// const indirect_method = INDIRECT_EXPRESSION_METHODS[method_name]
	// if(indirect_method){
	// 	this._create_method_and_dependencies(node, method_name, arguments_joined)
	// 	return `await methods[${this.method_index}].process_arguments(${arguments_joined})`
	// }

	// this.set_error(`unknown method: ${method_name}`)
	//}
	protected traverse_BinaryExpression(node: jsep.BinaryExpression): string {
		return `${this.traverse_node(node.left)} ${node.operator} ${this.traverse_node(node.right)}`;
	}
	protected traverse_LogicalExpression(node: jsep.LogicalExpression): string {
		// || or &&
		return `${this.traverse_node(node.left)} ${node.operator} ${this.traverse_node(node.right)}`;
	}
	protected traverse_MemberExpression(node: jsep.MemberExpression): string {
		return `${this.traverse_node(node.object)}.${this.traverse_node(node.property)}`;
	}
	protected traverse_ConditionalExpression(node: jsep.ConditionalExpression): string {
		return `(${this.traverse_node(node.test)}) ? (${this.traverse_node(node.consequent)}) : (${this.traverse_node(
			node.alternate
		)})`;
	}

	// currently only used for string expressions such as
	// pt_`@ptnum+1`
	protected traverse_Compound(node: jsep.Compound): string {
		const args = node.body;
		console.log(args);
		let traversed_args = [];
		for (let i = 0; i < args.length; i++) {
			const arg_node = args[i];
			if (arg_node.type == 'Identifier') {
				if ((arg_node as jsep.Identifier).name[0] == VARIABLE_PREFIX) {
					traversed_args.push('`${' + this.traverse_node(arg_node) + '}`');
				} else {
					traversed_args.push(`'${(arg_node as jsep.Identifier).name}'`);
				}
			} else {
				traversed_args.push('`${' + this.traverse_node(arg_node) + '}`');
			}
		}
		return traversed_args.join(' + ');
		// this may work for things like  [1,-2,3][$F%2]
		// but can be confusing for more operators like [1,-2,3][$F%2][2]

		// console.log(node)
		// return `(${this.traverse_node(node.test)}) ? (${this.traverse_node(node.consequent)}) : (${this.traverse_node(node.alternate)})`
		// this.set_error("unrecognised expression Compound")
		// return ""
	}
	protected abstract traverse_UnaryExpression(node: jsep.UnaryExpression): string; //{

	// if (node.operator === ATTRIBUTE_PREFIX) {
	// 	const attrib_name = this.traverse_node(node.argument);
	// 	return `param.entity_attrib_value(${QUOTE}${attrib_name}${QUOTE})`
	// } else {
	// 	return `${node.operator}${this.traverse_node(node.argument)}`; // -5
	// }
	//}

	protected traverse_Literal(node: jsep.Literal): string {
		return `${node.raw}`; // 5 or 'string' (raw will include quotes)
	}

	protected abstract traverse_Identifier(node: jsep.Identifier): string | undefined; //{
	// const identifier_first_char = node.name[0]
	// if(identifier_first_char == VARIABLE_PREFIX){
	// 	const identifier_name_without_dollar_sign = node.name.substr(1)

	// 	// globals constants: Math.PI or Math.E
	// 	const direct_constant_name = GLOBAL_CONSTANTS[identifier_name_without_dollar_sign]
	// 	if(direct_constant_name){
	// 		return direct_constant_name
	// 	}

	// 	// scene or node globals: $F, $CH, $OS
	// 	const method_name = `Identifier_${identifier_name_without_dollar_sign}_body`
	// 	const method = this[method_name]
	// 	if(method){
	// 		return this[method_name]()
	// 	}else{
	// 		this.set_error(`identifier unknown: ${node.name}`);
	// 	}

	// } else {
	// 	return node.name // @ptnum will call this method and return "ptnum"
	// }
	//}

	//
	//
	// Identifier methods (called from Identifier_body)
	//
	//
	// abstract Identifier_F_body(): string //{
	// this.dependencies.push(this.param.scene().context())
	// return `param.scene().frame()`
	//}
	// abstract Identifier_CH_body(): string //{
	// return `${QUOTE}${this.param.name()}${QUOTE}`
	//}
	// TODO:
	// '$CEX': '_eval_identifier_as_expression_centroid_x',
	// '$CEY': '_eval_identifier_as_expression_centroid_y',
	// '$CEZ': '_eval_identifier_as_expression_centroid_z',
	// '$CH': '_eval_identifier_as_param_name',
	// '$OS': '_eval_identifier_as_node_name',

	//
	//
	// Methods dependencies
	//
	//
	// protected _create_method_and_dependencies(node: jsep.CallExpression, method_name: string, arguments_joined: string) {
	// 	const method_constructor = Method[method_name]
	// 	const method = new method_constructor(this.param)
	// 	this.method_index += 1
	// 	this.methods[this.method_index] = method

	// 	const dependency_arguments_function = new Function(`return [${arguments_joined}]`)
	// 	const dependency_arguments = dependency_arguments_function()

	// 	const reference_search_result = method.find_dependencies(dependency_arguments)
	// 	reference_search_result.found_graph_nodes.forEach((graph_node)=>{
	// 		this.dependencies.push(graph_node)
	// 	})
	// 	reference_search_result.missing_paths.forEach((path)=>{
	// 		this.jsep_nodes_by_missing_paths[path] = this.jsep_nodes_by_missing_paths[path] || []
	// 		this.jsep_nodes_by_missing_paths[path].push(node)
	// 	})
	// }
}
