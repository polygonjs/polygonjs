import {BaseNodeGlMathFunctionArg3GlNode} from './_BaseMathFunction';
import FitMethods from './gl/fit.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';

const DefaultValues: Dictionary<number> = {
	src_min: 0,
	src_max: 1,
};

export class Fit01GlNode extends BaseNodeGlMathFunctionArg3GlNode {
	static type() {
		return 'fit01';
	}

	_gl_input_name(index: number): string {
		return ['val', 'src_min', 'src_max'][index];
	}
	param_default_value(name: string) {
		return DefaultValues[name];
	}
	gl_method_name(): string {
		return 'fit01';
	}

	gl_function_definitions() {
		return [new FunctionGLDefinition(this, FitMethods)];
	}
}
