import {BaseNodeGlMathFunctionArg5GlNode} from './_BaseMathFunction';
import {BaseNodeGlMathFunctionArg3GlNode} from './_BaseMathFunction';
import FitMethods from './gl/fit.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {PolyDictionary} from '../../../types/GlobalTypes';

//
//
// FIT
//
//
const FitDefaultValues: PolyDictionary<number> = {
	srcMin: 0,
	srcMax: 1,
	destMin: 0,
	destMax: 1,
};

export class FitGlNode extends BaseNodeGlMathFunctionArg5GlNode {
	static type() {
		return 'fit';
	}

	protected _gl_input_name(index: number): string {
		return ['val', 'srcMin', 'srcMax', 'destMin', 'destMax'][index];
	}
	paramDefaultValue(name: string) {
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
const FitTo01DefaultValues: PolyDictionary<number> = {
	srcMin: 0,
	srcMax: 1,
};

export class FitTo01GlNode extends BaseNodeGlMathFunctionArg3GlNode {
	static type() {
		return 'fitTo01';
	}

	_gl_input_name(index: number): string {
		return ['val', 'srcMin', 'srcMax'][index];
	}
	paramDefaultValue(name: string) {
		return FitTo01DefaultValues[name];
	}
	gl_method_name(): string {
		return 'fitTo01';
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
const FitFrom01DefaultValues: PolyDictionary<number> = {
	destMin: 0,
	destMax: 1,
};

export class FitFrom01GlNode extends BaseNodeGlMathFunctionArg3GlNode {
	static type() {
		return 'fitFrom01';
	}

	_gl_input_name(index: number): string {
		return ['val', 'destMin', 'destMax'][index];
	}
	paramDefaultValue(name: string) {
		return FitFrom01DefaultValues[name];
	}
	gl_method_name(): string {
		return 'fitFrom01';
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
const FitFrom01ToVarianceDefaultValues: PolyDictionary<number> = {
	center: 0.5,
	variance: 0.5,
};

export class FitFrom01ToVarianceGlNode extends BaseNodeGlMathFunctionArg3GlNode {
	static type() {
		return 'fitFrom01ToVariance';
	}

	_gl_input_name(index: number): string {
		return ['val', 'center', 'variance'][index];
	}
	paramDefaultValue(name: string) {
		return FitFrom01ToVarianceDefaultValues[name];
	}
	gl_method_name(): string {
		return 'fitFrom01ToVariance';
	}

	gl_function_definitions() {
		return [new FunctionGLDefinition(this, FitMethods)];
	}
}
