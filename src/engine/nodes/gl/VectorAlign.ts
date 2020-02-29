// import {BaseNodeGlMathFunctionArg3} from './_BaseMathFunctionArg3';
// import {Connection} from './GlData';
// import {Definition} from './Definition/_Module';
// import Quaternion from './Gl/quaternion.glsl';

// export class VectorAlign extends BaseNodeGlMathFunctionArg3 {
// 	static type() {
// 		return 'vector_align';
// 	}

// 	gl_input_name(index: number) {
// 		return ['start', 'end', 'up'][index];
// 	}
// 	gl_input_default_value(name: string) {
// 		return {
// 			start: [0, 0, 1],
// 			end: [1, 0, 0],
// 			up: [0, 1, 0],
// 		}[name];
// 	}
// 	gl_method_name(): string {
// 		return 'vector_align_with_up';
// 	}

// 	protected expected_named_input_constructors() {
// 		return [Connection.Vec3, Connection.Vec3, Connection.Vec3];
// 	}
// 	protected expected_named_output_constructors() {
// 		return [Connection.Vec4];
// 	}
// 	gl_function_definitions() {
// 		return [new Definition.Function(this, Quaternion)];
// 	}
// }
