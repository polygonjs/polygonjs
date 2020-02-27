import {BaseNodeGlMathFunctionArgBoolean2GlNode} from './_BaseMathFunctionArgBoolean2';

interface MathArg2BooleanOptions {
	op: string;
}

function MathFunctionArg2BooleanFactory(type: string, options: MathArg2BooleanOptions) {
	return class Node extends BaseNodeGlMathFunctionArgBoolean2GlNode {
		static type() {
			return type;
		}
		boolean_operation(): string {
			return options.op;
		}
		gl_output_name() {
			return type;
		}
		gl_input_name(index = 0) {
			return `${type}${index}`;
		}
	};
}
export class AndGlNode extends MathFunctionArg2BooleanFactory('and', {op: '&&'}) {}
export class OrGlNode extends MathFunctionArg2BooleanFactory('or', {op: '||'}) {}
