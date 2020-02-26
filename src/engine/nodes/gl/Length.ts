import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunctionArg1';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';

export class LengthGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static type() {
		return 'length';
	}

	gl_input_name(index: number) {
		return ['x'][index];
	}
	gl_method_name(): string {
		return 'length';
	}

	protected expected_output_types() {
		return [ConnectionPointType.FLOAT];
	}
}
