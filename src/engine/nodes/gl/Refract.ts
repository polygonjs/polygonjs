import {BaseGlMathFunctionGlNode} from './_BaseMathFunction';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';

export class RefractGlNode extends BaseGlMathFunctionGlNode {
	static type() {
		return 'refract';
	}

	gl_input_name(index: number) {
		return ['I', 'N', 'eta'][index];
	}
	gl_output_name() {
		return 'refract';
	}
	gl_method_name(): string {
		return 'refract';
	}

	protected expected_input_types() {
		const type = this.input_connection_type() || ConnectionPointType.FLOAT;
		return [type, type, ConnectionPointType.FLOAT];
	}

	protected expected_output_types() {
		const type = this.output_connection_type();
		return [type];
	}
}
