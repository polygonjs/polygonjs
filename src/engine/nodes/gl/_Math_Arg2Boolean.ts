import {BaseNodeGlMathFunctionArgBoolean2GlNode} from './_BaseMathFunctionArgBoolean2';

interface MathArg2BooleanOptions {
	op: string;
}

function MathFunctionArg2BooleanFactory(type: string, options: MathArg2BooleanOptions) {
	return class Node extends BaseNodeGlMathFunctionArgBoolean2GlNode {
		static type() {
			return type;
		}
		initializeNode() {
			super.initializeNode();
			this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
			this.io.connection_points.set_output_name_function(this._gl_output_name.bind(this));
		}

		boolean_operation(): string {
			return options.op;
		}
		protected _gl_output_name(index: number) {
			return type;
		}
		protected _gl_input_name(index = 0) {
			return `${type}${index}`;
		}
	};
}
export class AndGlNode extends MathFunctionArg2BooleanFactory('and', {op: '&&'}) {}
export class OrGlNode extends MathFunctionArg2BooleanFactory('or', {op: '||'}) {}
