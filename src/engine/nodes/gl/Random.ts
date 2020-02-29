// import {BaseNodeGl} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {TypedConnectionFloat} from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';

// export class Random extends BaseNodeGl {
// 	static type() {
// 		return 'random';
// 	}

// 	constructor() {
// 		super();

// 		// this.set_inputs([
// 		// 	new GlDataIONumeric('in')
// 		// ])
// 		this.set_named_outputs([new TypedConnectionFloat('float')]);
// 	}

// 	create_params() {
// 		this.add_param(ParamType.VECTOR2, 'vec2', [1, 1]);
// 	}
// 	set_lines() {
// 		// const function_declaration_lines = []
// 		const body_lines = [];

// 		// http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
// 		// 		function_declaration_lines.push(`highp float rand2(vec2 co){
// 		// 	highp float a = 12.9898;
// 		// 	highp float b = 78.233;
// 		// 	highp float c = 43758.5453;
// 		// 	highp float dt= dot(co.xy ,vec2(a,b));
// 		// 	highp float sn= mod(dt,3.14);
// 		// 	return fract(sin(sn) * c);
// 		// }`)

// 		const value = ThreeToGl.vector2(this.variable_for_input('vec2'));

// 		const float = this.gl_var_name('float');
// 		body_lines.push(`float ${float} = rand(${value})`);
// 		// this.set_function_declaration_lines(function_declaration_lines)
// 		this.set_body_lines(body_lines);
// 	}
// }
