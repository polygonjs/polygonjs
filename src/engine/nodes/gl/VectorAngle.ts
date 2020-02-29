// import {BaseNodeGlMathFunctionArg3} from './_BaseMathFunctionArg3';
// import {Connection} from './GlData';
// import {Definition} from './Definition/_Module';
// import Quaternion from './Gl/quaternion.glsl';

// export class VectorAngle extends BaseNodeGlMathFunctionArg3 {
// 	static type() {
// 		return 'vector_angle';
// 	}

// 	gl_input_name(index: number) {
// 		return ['start', 'end'][index];
// 	}
// 	gl_input_default_value(name: string) {
// 		return {
// 			start: [0, 0, 1],
// 			end: [0, 1, 0],
// 		}[name];
// 	}
// 	gl_method_name(): string {
// 		return 'vector_angle';
// 	}

// 	protected expected_named_input_constructors() {
// 		return [Connection.Vec3, Connection.Vec3];
// 	}
// 	protected expected_named_output_constructors() {
// 		return [Connection.Float];
// 	}
// 	gl_function_definitions() {
// 		return [new Definition.Function(this, Quaternion)];
// 	}
// }
