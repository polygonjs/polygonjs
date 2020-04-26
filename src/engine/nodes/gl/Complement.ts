import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunction';
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
		return [new FunctionGLDefinition(this, ComplementMethods)];
	}
}
