// import {BaseNodeGlMathFunctionArg3} from './_BaseMathFunctionArg3';
// import {Definition} from './Definition/_Module';
// import FitMethods from './Gl/fit.glsl';

// export class Fit01 extends BaseNodeGlMathFunctionArg3 {
// 	static type() {
// 		return 'fit01';
// 	}

// 	gl_input_name(index: number): string {
// 		return ['val', 'src_min', 'src_max'][index];
// 	}
// 	gl_input_default_value(name: string) {
// 		return {
// 			src_max: 1,
// 		}[name];
// 	}
// 	gl_method_name(): string {
// 		return 'fit01';
// 	}

// 	gl_function_definitions() {
// 		return [new Definition.Function(this, FitMethods)];
// 	}
// }
