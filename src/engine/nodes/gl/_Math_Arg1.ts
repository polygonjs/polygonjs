import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunction';

interface MathArg1Options {
	in?: string;
	out?: string;
	method?: string;
}

function MathFunctionArg1Factory(type: string, options: MathArg1Options = {}) {
	const gl_method_name = options.method || type;
	const gl_output_name = options.out || 'val';
	const gl_input_name = options.in || 'in';
	return class Node extends BaseNodeGlMathFunctionArg1GlNode {
		static type() {
			return type;
		}
		initializeNode() {
			super.initializeNode();
			this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
			this.io.connection_points.set_output_name_function(this._gl_output_name.bind(this));
		}
		protected _gl_input_name(index: number): string {
			return gl_input_name;
		}
		protected _gl_output_name(index: number): string {
			return gl_output_name;
		}
		gl_method_name(): string {
			return gl_method_name;
		}
	};
}
export class AbsGlNode extends MathFunctionArg1Factory('abs') {}
export class AcosGlNode extends MathFunctionArg1Factory('acos', {out: 'radians'}) {}
export class AsinGlNode extends MathFunctionArg1Factory('asin', {out: 'radians'}) {}
export class AtanGlNode extends MathFunctionArg1Factory('atan', {out: 'radians'}) {}
export class CeilGlNode extends MathFunctionArg1Factory('ceil') {}
export class CosGlNode extends MathFunctionArg1Factory('cos', {in: 'radians'}) {}
export class DegreesGlNode extends MathFunctionArg1Factory('degrees', {in: 'radians', out: 'degrees'}) {}

export class ExpGlNode extends MathFunctionArg1Factory('exp') {}
export class Exp2GlNode extends MathFunctionArg1Factory('exp2') {}
export class FloorGlNode extends MathFunctionArg1Factory('floor') {}
export class FractGlNode extends MathFunctionArg1Factory('fract') {}
export class InverseSqrtGlNode extends MathFunctionArg1Factory('inverseSqrt', {method: 'inversesqrt'}) {}
export class LogGlNode extends MathFunctionArg1Factory('log') {}
export class Log2GlNode extends MathFunctionArg1Factory('log2') {}
export class NormalizeGlNode extends MathFunctionArg1Factory('normalize', {out: 'normalized'}) {}
export class RadiansGlNode extends MathFunctionArg1Factory('radians', {in: 'degrees', out: 'radians'}) {}
export class SignGlNode extends MathFunctionArg1Factory('sign') {}
export class SinGlNode extends MathFunctionArg1Factory('sin', {in: 'radians'}) {}
export class SqrtGlNode extends MathFunctionArg1Factory('sqrt') {}
export class TanGlNode extends MathFunctionArg1Factory('tan') {}
