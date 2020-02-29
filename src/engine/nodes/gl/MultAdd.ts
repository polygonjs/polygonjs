// import {BaseNodeGlMathFunctionArg4} from './_BaseMathFunctionArg4';
// // import {ParamType} from 'src/Engine/Param/_Module';
// // import {TypedConnectionFloat} from './GlData'
// import {ThreeToGl} from 'src/Core/ThreeToGl';

// export class MultAdd extends BaseNodeGlMathFunctionArg4 {
// 	static type() {
// 		return 'mult_add';
// 	}

// 	gl_input_name(index: number) {
// 		return ['value', 'pre_add', 'mult', 'post_add'][index];
// 	}
// 	gl_input_default_value(name: string) {
// 		return {
// 			mult: 1,
// 		}[name];
// 	}

// 	set_lines() {
// 		const body_lines = [];

// 		const value = ThreeToGl.any(this.variable_for_input('value'));
// 		const pre_add = ThreeToGl.any(this.variable_for_input('pre_add'));
// 		const mult = ThreeToGl.any(this.variable_for_input('mult'));
// 		const post_add = ThreeToGl.any(this.variable_for_input('post_add'));

// 		const gl_type = this.named_outputs()[0].type();
// 		const out = this.gl_var_name('value');
// 		body_lines.push(`${gl_type} ${out} = (${mult}*(${value} + ${pre_add})) + ${post_add}`);
// 		this.set_body_lines(body_lines);
// 	}
// }
