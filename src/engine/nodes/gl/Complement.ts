import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunctionArg1';
import ComplementMethods from './gl/complement.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';

export class ComplementGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static type() {
		return 'complement';
	}

	gl_method_name(): string {
		return 'complement';
	}

	gl_function_definitions() {
		return [
			new FunctionGLDefinition(
				this,
				this.gl_connections_controller.first_input_connection_type() || ConnectionPointType.FLOAT,
				ComplementMethods
			),
		];
	}
}
