import {BaseGlMathFunctionGlNode} from './_BaseMathFunction';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';

export abstract class BaseNodeGlMathFunctionArg2GlNode extends BaseGlMathFunctionGlNode {
	protected expected_input_types() {
		const type = this.input_connection_type() || ConnectionPointType.FLOAT;
		return [type, type];
	}

	protected expected_output_types() {
		const type = this.output_connection_type();
		return [type];
	}
}
