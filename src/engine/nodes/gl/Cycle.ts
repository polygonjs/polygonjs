// import {BaseNodeGlMathFunctionArg3} from './_BaseMathFunctionArg3';
// import {Connection} from './GlData';
// import {Definition} from './Definition/_Module';
// import CycleMethods from './Gl/cycle.glsl';

// export class Cycle extends BaseNodeGlMathFunctionArg3 {
// 	static type() {
// 		return 'cycle';
// 	}

// 	gl_input_name(index: number) {
// 		return ['in', 'min', 'max'][index];
// 	}
// 	gl_input_default_value(name: string) {
// 		return {max: 1}[name];
// 	}
// 	gl_method_name(): string {
// 		return 'cycle';
// 	}

// 	gl_function_definitions() {
// 		return [new Definition.Function(this, CycleMethods)];
// 	}
// }
