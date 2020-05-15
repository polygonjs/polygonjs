import {BaseNodeGlMathFunctionArg2GlNode} from './_BaseMathFunction';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';

interface MathArg2Options {
	in?: [string, string];
	out?: string;
	default_in_type?: GlConnectionPointType;
	allowed_in_types?: GlConnectionPointType[];
	out_type?: GlConnectionPointType;
	method?: string;
	functions?: string[];
}

export function MathFunctionArg2Factory(type: string, options: MathArg2Options = {}) {
	const gl_method_name = options.method || type;
	const gl_output_name = options.out || 'val';
	const gl_input_names = options.in || ['in0', 'in1'];
	const default_in_type = options.default_in_type;
	const allowed_in_types = options.allowed_in_types;
	const out_type = options.out_type;
	const functions = options.functions || [];
	return class Node extends BaseNodeGlMathFunctionArg2GlNode {
		static type() {
			return type;
		}
		initialize_node() {
			super.initialize_node();
			this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
			this.io.connection_points.set_output_name_function(this._gl_output_name.bind(this));

			this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));

			if (out_type) {
				this.io.connection_points.set_expected_output_types_function(() => [out_type]);
			}
		}
		_gl_input_name(index: number): string {
			return gl_input_names[index];
		}
		_gl_output_name(index: number): string {
			return gl_output_name;
		}
		gl_method_name(): string {
			return gl_method_name;
		}
		gl_function_definitions(): FunctionGLDefinition[] {
			if (out_type) {
				return functions.map((f) => new FunctionGLDefinition(this, f));
			} else {
				return [];
			}
		}
		protected _expected_input_types() {
			let first_input_type = this.io.connection_points.first_input_connection_type();
			if (first_input_type && allowed_in_types) {
				if (!allowed_in_types.includes(first_input_type)) {
					// if the first input type is not allowed, either leave the connection point as is,
					// or use the default if there is none
					const first_connection = this.io.inputs.named_input_connection_points[0];
					if (first_connection) {
						first_input_type = first_connection.type;
					} else {
						first_input_type = default_in_type;
					}
				}
			}
			const type = first_input_type || default_in_type || GlConnectionPointType.FLOAT;
			return [type, type];
		}
	};
}
export class DistanceGlNode extends MathFunctionArg2Factory('distance', {
	in: ['p0', 'p1'],
	default_in_type: GlConnectionPointType.VEC3,
	allowed_in_types: [GlConnectionPointType.VEC2, GlConnectionPointType.VEC3, GlConnectionPointType.VEC4],
	out_type: GlConnectionPointType.FLOAT,
}) {}
export class DotGlNode extends MathFunctionArg2Factory('dot', {
	in: ['vec0', 'vec1'],
	default_in_type: GlConnectionPointType.VEC3,
	allowed_in_types: [GlConnectionPointType.VEC2, GlConnectionPointType.VEC3, GlConnectionPointType.VEC4],
	out_type: GlConnectionPointType.FLOAT,
}) {}
export class MaxGlNode extends MathFunctionArg2Factory('max') {}
export class MinGlNode extends MathFunctionArg2Factory('min') {}
export class ModGlNode extends MathFunctionArg2Factory('mod') {
	param_default_value(name: string) {
		return ({in1: 1} as Dictionary<number>)[name];
	}
}
export class PowGlNode extends MathFunctionArg2Factory('pow', {in: ['x', 'y']}) {}
export class ReflectGlNode extends MathFunctionArg2Factory('reflect', {
	in: ['I', 'N'],
	default_in_type: GlConnectionPointType.VEC3,
}) {}
export class StepGlNode extends MathFunctionArg2Factory('step', {in: ['edge', 'x']}) {}
