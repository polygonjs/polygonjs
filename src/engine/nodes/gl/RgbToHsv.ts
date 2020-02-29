// import {BaseNodeGl} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {TypedConnectionVec3} from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';
// import {Definition} from './Definition/_Module';

// import Rgb2Hsv from './Gl/rgb2hsv.glsl';

// export class RgbToHsv extends BaseNodeGl {
// 	static type() {
// 		return 'rgb_to_hsv';
// 	}

// 	constructor() {
// 		super();

// 		// this.set_inputs([
// 		// 	new GlDataIONumeric('in')
// 		// ])
// 		this.set_named_outputs([new TypedConnectionVec3('hsv')]);
// 	}

// 	create_params() {
// 		this.add_param(ParamType.VECTOR, 'rgb', [1, 1, 1]);
// 	}
// 	set_lines() {
// 		const function_declaration_lines = [];
// 		const body_lines = [];

// 		function_declaration_lines.push(new Definition.Function(this, Rgb2Hsv));

// 		const rgb = ThreeToGl.vector3(this.variable_for_input('rgb'));

// 		const hsv = this.gl_var_name('hsv');
// 		body_lines.push(`vec3 ${hsv} = rgb2hsv(${rgb})`);
// 		this.set_definitions(function_declaration_lines);
// 		this.set_body_lines(body_lines);
// 	}
// }
