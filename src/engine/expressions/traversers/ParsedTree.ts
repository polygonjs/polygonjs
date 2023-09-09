import jsep from 'jsep';
import {CoreType} from '../../../core/Type';
import {BaseParamType} from '../../params/_Base';
jsep.addUnaryOp('@');
let precedence = 10;
jsep.addBinaryOp('**', precedence);
// precedence = 1
// jsep.addBinaryOp('`', precedence)
// const HOUDINI_QUOTE_CODE = 96; // houdini quote
// const JSEP_COMPOUND = 'Compound'
const JSEP_IDENTIFIER = 'Identifier';
const JSEP_LITERAL = 'Literal';
// const JSEP_BINARY_EXPRESSION = 'BynaryExpression'
const JSEP_CALL_EXPRESSION = 'CallExpression';
const STRING_EXPRESSION_SEPARATOR = '`';

export function stringValueElements(v: string): string[] {
	if (v != null) {
		if (CoreType.isString(v)) {
			return v.split(STRING_EXPRESSION_SEPARATOR);
		} else {
			return [];
		}
	} else {
		return [];
	}
}

export class ParsedTree {
	private _node: jsep.Expression | undefined;
	private _errorMessage: string | undefined;

	constructor(private _param: BaseParamType) {}
	node() {
		return this._node;
	}
	errorMessage() {
		return this._errorMessage;
	}

	parseExpression(string: string) {
		try {
			this.reset();
			this._node = jsep(string);
		} catch (e) {
			const message = `could not parse the expression '${string}' (error: ${e})`;
			this._errorMessage = message;
		}
	}
	parseExpressionForStringParam(string: string) {
		try {
			this.reset();

			const elements = stringValueElements(string);
			const nodes = [];
			for (let i = 0; i < elements.length; i++) {
				const element = elements[i];
				let node: jsep.Expression;
				if (i % 2 == 1) {
					node = jsep(element);
				} else {
					// if the expression is like:
					//
					// <div style='will-change: transform, opacity;'>`@ptnum`</div>
					//
					// then the first element here will be:
					//
					// <div style='will-change: transform, opacity;'>
					//
					// and if we surround it by single quotes (')
					// the the quotes already inside the element will create a parsing error.
					// We therefore need to escape them first.
					const sanitizedElement = element.replace(/\'/g, "\\'");
					node = {
						type: JSEP_LITERAL,
						value: `'${sanitizedElement}'`,
						raw: `'${sanitizedElement}'`,
					};
					// we must add this node to the ignore list of the missing references controller.
					// If it is not added, a param with the name of the element will be searched for.
					this._param.scene().missingExpressionReferencesController.registerToIgnore(node);
				}
				nodes.push(node);
				// nodes.push({
				// 	type: JSEP_CALL_EXPRESSION,
				// 	arguments: [node],
				// 	callee: {
				// 		type: JSEP_IDENTIFIER,
				// 		name: 'toString',
				// 	}
				// })
			}
			// let last_plus_node;
			// for(let i=0; i<(nodes.length-1); i++){
			// 	const plus_node = {
			// 		type: JSEP_BINARY_EXPRESSION,
			// 		operator: '+',
			// 		left: last_plus_node || nodes[i],
			// 		right: nodes[i+1],
			// 	}
			// 	last_plus_node = plus_node;
			// }
			// this.node = last_plus_node
			this._node = (<unknown>{
				type: JSEP_CALL_EXPRESSION,
				arguments: nodes,
				callee: {
					type: JSEP_IDENTIFIER,
					name: 'strConcat',
				},
			}) as jsep.Compound;
		} catch (e) {
			const message = `could not parse the expression '${string}' (error: ${e})`;
			this._errorMessage = message;
		}
	}

	// static string_value_contains_expression(v:string): boolean{
	// 	return ((this.string_value_elements(v).length - 1) % 2) === 0;
	// }

	// deep_parse_for_string_expressions(){
	// 	// for string expressions which have more than a single `<expr>` element
	// 	// pt_`@ptnum`
	// 	// `@ptnum`_pt
	// 	// pt_`@ptnum`_`1+1`
	// 	if(this.node.type == JSEP_COMPOUND){
	// 		const args = this.node.body
	// 		let arg;
	// 		for(let i=0; i<args.length; i++){
	// 			arg = args[i]
	// 			if(arg.type == JSEP_LITERAL){
	// 				const arg_node = jsep(arg.value)
	// 				args[i] = arg_node
	// 			}
	// 		}
	// 	} else {
	// 		// for string expressions which havea single `<expr>` element
	// 		// `@ptnum`
	// 		if(this.node.type == JSEP_LITERAL){
	// 			const raw = this.node.raw
	// 			const first_char_code = raw.charCodeAt(0)
	// 			const last_char_code = raw.charCodeAt(raw.length-1)
	// 			if(first_char_code == HOUDINI_QUOTE_CODE && last_char_code == HOUDINI_QUOTE_CODE){
	// 				this.node = jsep("''+"+this.node.value) // add the prefix ''+ to ensure we have a string as a result, and not a number
	// 			}
	// 		}
	// 	}
	// }

	private reset() {
		this._node = undefined;
		this._errorMessage = undefined;
	}
}
