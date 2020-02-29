// import {BaseNodeGl} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {TypedConnectionVec3} from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';
// import {Definition} from './Definition/_Module';

// import Hsv2Rgb from './Gl/hsv2rgb.glsl';

// export class HsvToRgb extends BaseNodeGl {
// 	static type() {
// 		return 'hsv_to_rgb';
// 	}

// 	constructor() {
// 		super();

// 		// this.set_inputs([
// 		// 	new GlDataIONumeric('in')
// 		// ])
// 		this.set_named_outputs([new TypedConnectionVec3('rgb')]);
// 	}

// 	create_params() {
// 		this.add_param(ParamType.VECTOR, 'hsv', [1, 1, 1]);
// 	}
// 	set_lines() {
// 		const function_declaration_lines = [];
// 		const body_lines = [];

// 		function_declaration_lines.push(new Definition.Function(this, Hsv2Rgb));

// 		const value = ThreeToGl.vector3(this.variable_for_input('hsv'));

// 		const rgb = this.gl_var_name('rgb');
// 		body_lines.push(`vec3 ${rgb} = hsv2rgb(${value})`);
// 		this.set_definitions(function_declaration_lines);
// 		this.set_body_lines(body_lines);
// 	}
// }
