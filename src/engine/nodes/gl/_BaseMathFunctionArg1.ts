import {BaseGlMathFunctionGlNode} from './_BaseMathFunction';

export abstract class BaseNodeGlMathFunctionArg1GlNode extends BaseGlMathFunctionGlNode {
	gl_input_name(index: number) {
		return 'in';
	}
	protected expected_input_types() {
		return [this.input_connection_type()];
	}

	// protected expected_named_input_constructors() {
	// 	const constructor = this.input_connection_constructor() || Connection.Float;
	// 	return [constructor];
	// }

	// protected expected_named_output_constructors() {
	// 	const constructor = this.output_connection_constructor();
	// 	return [constructor];
	// }
}
