// import {BaseNodeGlMathFunctionArg5} from './_BaseMathFunctionArg5';
// import {Definition} from './Definition/_Module';
// import FitMethods from './Gl/fit.glsl';

// export class Fit extends BaseNodeGlMathFunctionArg5 {
// 	static type() {
// 		return 'fit';
// 	}

// 	gl_input_name(index: number): string {
// 		return ['val', 'src_min', 'src_max', 'dest_min', 'dest_max'][index];
// 	}
// 	gl_input_default_value(name: string) {
// 		return {
// 			src_max: 1,
// 			dest_max: 1,
// 		}[name];
// 	}
// 	gl_method_name(): string {
// 		return 'fit';
// 	}

// 	gl_function_definitions() {
// 		return [new Definition.Function(this, FitMethods)];
// 	}
// }
