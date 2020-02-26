import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunctionArg1';
import ComplementMethods from './gl/complement.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';

export class ComplementGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static type() {
		return 'complement';
	}

	gl_method_name(): string {
		return 'complement';
	}

	gl_function_definitions() {
		return [new FunctionGLDefinition(this, this.output_connection_type(), ComplementMethods)];
	}
}
