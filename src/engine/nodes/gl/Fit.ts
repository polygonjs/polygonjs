import {BaseNodeGlMathFunctionArg5GlNode} from './_BaseMathFunction';
import FitMethods from './gl/fit.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';

const DefaultValues: Dictionary<number> = {
	src_min: 0,
	src_max: 1,
	dest_min: 0,
	dest_max: 1,
};

export class FitGlNode extends BaseNodeGlMathFunctionArg5GlNode {
	static type() {
		return 'fit';
	}

	protected _gl_input_name(index: number): string {
		return ['val', 'src_min', 'src_max', 'dest_min', 'dest_max'][index];
	}
	gl_input_default_value(name: string) {
		return DefaultValues[name];
	}
	protected gl_method_name(): string {
		return 'fit';
	}

	gl_function_definitions() {
		return [new FunctionGLDefinition(this, FitMethods)];
	}
}
