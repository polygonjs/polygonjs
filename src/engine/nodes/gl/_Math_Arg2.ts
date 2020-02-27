import {BaseNodeGlMathFunctionArg2GlNode} from './_BaseMathFunctionArg2';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';

interface MathArg2Options {
	in?: [string, string];
	out?: string;
	out_type?: ConnectionPointType;
	method?: string;
}

function MathFunctionArg2Factory(type: string, options: MathArg2Options = {}) {
	const gl_method_name = options.method || type;
	const gl_output_name = options.out || 'val';
	const gl_input_names = options.in || ['in0', 'in1'];
	const out_type = options.out_type || ConnectionPointType.FLOAT;
	return class Node extends BaseNodeGlMathFunctionArg2GlNode {
		static type() {
			return type;
		}
		gl_input_name(index: number): string {
			return gl_input_names[index];
		}
		gl_output_name(): string {
			return gl_output_name;
		}
		gl_method_name(): string {
			return gl_method_name;
		}
		expected_output_type() {
			return out_type;
		}
	};
}
export class DistanceGlNode extends MathFunctionArg2Factory('distance', {in: ['p0', 'p1']}) {}
export class DotGlNode extends MathFunctionArg2Factory('dot', {in: ['vec0', 'vec1']}) {}
export class MaxGlNode extends MathFunctionArg2Factory('max') {}
export class MinGlNode extends MathFunctionArg2Factory('min') {}
export class ModGlNode extends MathFunctionArg2Factory('mod') {}
export class PowGlNode extends MathFunctionArg2Factory('pow', {in: ['x', 'y']}) {}
export class ReflectGlNode extends MathFunctionArg2Factory('reflect', {in: ['I', 'N']}) {}
export class StepGlNode extends MathFunctionArg2Factory('step', {in: ['edge', 'x']}) {}
