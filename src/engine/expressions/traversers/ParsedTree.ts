import lodash_isString from 'lodash/isString';

import jsep from 'jsep';
jsep.addUnaryOp('@');
// self.jsep = jsep
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

export class ParsedTree {
	public node: jsep.Expression | undefined;
	public error_message: string | undefined;

	constructor() {}

	parse_expression(string: string) {
		try {
			this.reset();
			this.node = jsep(string);
		} catch (e) {
			const message = `could not parse the expression '${string}' (error: ${e})`;
			this.error_message = message;
		}
	}
	parse_expression_for_string_param(string: string) {
		try {
			this.reset();

			const elements = ParsedTree.string_value_elements(string);
			const nodes = [];
			for (let i = 0; i < elements.length; i++) {
				const element = elements[i];
				let node;
				if (i % 2 == 1) {
					node = jsep(element);
				} else {
					node = {
						type: JSEP_LITERAL,
						value: `'${element}'`,
						raw: `'${element}'`,
					};
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
			this.node = (<unknown>{
				type: JSEP_CALL_EXPRESSION,
				arguments: nodes,
				callee: {
					type: JSEP_IDENTIFIER,
					name: 'str_concat',
				},
			}) as jsep.Compound;
		} catch (e) {
			const message = `could not parse the expression '${string}' (error: ${e})`;
			this.error_message = message;
		}
	}

	static string_value_elements(v: string): string[] {
		if (v != null) {
			if (lodash_isString(v)) {
				return v.split(STRING_EXPRESSION_SEPARATOR);
			} else {
				return [];
			}
		} else {
			return [];
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
		this.node = undefined;
		this.error_message = undefined;
	}
}
