import {BaseNodeGlMathFunctionArg5GlNode} from './_BaseMathFunction';
import {BaseNodeGlMathFunctionArg3GlNode} from './_BaseMathFunction';
import FitMethods from './gl/fit.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';

//
//
// FIT
//
//
const FitDefaultValues: Dictionary<number> = {
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
	param_default_value(name: string) {
		return FitDefaultValues[name];
	}
	protected gl_method_name(): string {
		return 'fit';
	}

	gl_function_definitions() {
		return [new FunctionGLDefinition(this, FitMethods)];
	}
}

//
//
// FIT TO 01
//
//
const FitTo01DefaultValues: Dictionary<number> = {
	src_min: 0,
	src_max: 1,
};

export class FitTo01GlNode extends BaseNodeGlMathFunctionArg3GlNode {
	static type() {
		return 'fit_to_01';
	}

	_gl_input_name(index: number): string {
		return ['val', 'src_min', 'src_max'][index];
	}
	param_default_value(name: string) {
		return FitTo01DefaultValues[name];
	}
	gl_method_name(): string {
		return 'fit_to_01';
	}

	gl_function_definitions() {
		return [new FunctionGLDefinition(this, FitMethods)];
	}
}

//
//
// FIT FROM 01
//
//
const FitFrom01DefaultValues: Dictionary<number> = {
	dest_min: 0,
	dest_max: 1,
};

export class FitFrom01GlNode extends BaseNodeGlMathFunctionArg3GlNode {
	static type() {
		return 'fit_from_01';
	}

	_gl_input_name(index: number): string {
		return ['val', 'dest_min', 'dest_max'][index];
	}
	param_default_value(name: string) {
		return FitFrom01DefaultValues[name];
	}
	gl_method_name(): string {
		return 'fit_from_01';
	}

	gl_function_definitions() {
		return [new FunctionGLDefinition(this, FitMethods)];
	}
}

//
//
// FIT FROM 01 TO VARIANCE
//
//
const FitFrom01ToVarianceDefaultValues: Dictionary<number> = {
	center: 0.5,
	variance: 0.5,
};

export class FitFrom01ToVarianceGlNode extends BaseNodeGlMathFunctionArg3GlNode {
	static type() {
		return 'fit_from_01_to_variance';
	}

	_gl_input_name(index: number): string {
		return ['val', 'center', 'variance'][index];
	}
	param_default_value(name: string) {
		return FitFrom01ToVarianceDefaultValues[name];
	}
	gl_method_name(): string {
		return 'fit_from_01_to_variance';
	}

	gl_function_definitions() {
		return [new FunctionGLDefinition(this, FitMethods)];
	}
}
