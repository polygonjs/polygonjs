// import {BaseNodeGl} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {TypedConnectionFloat} from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';

// export class Round extends BaseNodeGl {
// 	static type() {
// 		return 'round';
// 	}

// 	constructor() {
// 		super();

// 		// this.set_inputs([
// 		// 	new GlDataIONumeric('in')
// 		// ])
// 		this.set_named_outputs([new TypedConnectionFloat('round')]);
// 	}

// 	create_params() {
// 		this.add_param(ParamType.FLOAT, 'value', 1);
// 	}
// 	// https://hub.jmonkeyengine.org/t/round-with-glsl/8186/6
// 	set_lines() {
// 		// const function_declaration_lines = []
// 		const body_lines = [];

// 		// 		function_declaration_lines.push(`highp float round(float num){
// 		// 	return floor(num)-fract(num);
// 		// }`)

// 		const value = ThreeToGl.vector2(this.variable_for_input('value'));

// 		const float = this.gl_var_name('round');
// 		body_lines.push(`float ${float} = sign(${value})*floor(abs(${value})+0.5)`);
// 		// this.set_function_declaration_lines(function_declaration_lines)
// 		this.set_body_lines(body_lines);
// 	}
// }
