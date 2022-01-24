/**
 * outputs the length of a vector
 *
 *
 *
 */

import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunction';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

export class LengthGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static override type() {
		return 'length';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
	}

	protected override _gl_input_name(index: number) {
		return ['x'][index];
	}
	override gl_method_name(): string {
		return 'length';
	}

	protected override _expected_output_types() {
		return [GlConnectionPointType.FLOAT];
	}
}
