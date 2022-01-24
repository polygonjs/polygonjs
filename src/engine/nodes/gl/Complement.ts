/**
 * outputs a complement (1-x)
 *
 *
 */

import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunction';
import ComplementMethods from './gl/complement.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';

export class ComplementGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static override type() {
		return 'complement';
	}

	override gl_method_name(): string {
		return 'complement';
	}

	override gl_function_definitions() {
		return [new FunctionGLDefinition(this, ComplementMethods)];
	}
}
