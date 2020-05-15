import {BaseNodeGlMathFunctionArg3GlNode} from './_BaseMathFunction';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';
interface MathArg3Options {
	in?: [string, string, string];
	out?: string;
	out_type?: GlConnectionPointType;
	method?: string;
	default?: Dictionary<any>;
	functions?: string[];
}

export function MathFunctionArg3Factory(type: string, options: MathArg3Options = {}) {
	const gl_method_name = options.method || type;
	const gl_output_name = options.out || 'val';
	const gl_input_names = options.in || ['in0', 'in1', 'in2'];
	const param_default_values = options.default || {};
	const out_type = options.out_type || GlConnectionPointType.FLOAT;
	const functions = options.functions || [];
	return class Node extends BaseNodeGlMathFunctionArg3GlNode {
		static type() {
			return type;
		}
		initialize_node() {
			super.initialize_node();
			this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
			this.io.connection_points.set_output_name_function(this._gl_output_name.bind(this));
			this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
		}
		protected _gl_input_name(index: number): string {
			return gl_input_names[index];
		}
		protected _gl_output_name(index: number): string {
			return gl_output_name;
		}
		gl_method_name(): string {
			return gl_method_name;
		}
		protected _expected_output_types() {
			return [out_type];
		}
		param_default_value(name: string) {
			return param_default_values[name];
		}
		gl_function_definitions(): FunctionGLDefinition[] {
			return functions.map((f) => new FunctionGLDefinition(this, f));
		}
	};
}
export class ClampGlNode extends MathFunctionArg3Factory('clamp', {in: ['value', 'min', 'max'], default: {max: 1}}) {}
export class FaceforwardGlNode extends MathFunctionArg3Factory('face_forward', {in: ['N', 'I', 'Nref']}) {}
export class SmoothStepGlNode extends MathFunctionArg3Factory('smoothstep', {in: ['edge0', 'edge1', 'x']}) {}
