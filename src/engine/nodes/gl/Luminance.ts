// import {BaseNodeGl} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {TypedConnectionFloat} from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';
// import {Definition} from './Definition/_Module';

// import Hsv2Rgb from './Gl/hsv2rgb.glsl';

// export class Luminance extends BaseNodeGl {
// 	static type() {
// 		return 'luminance';
// 	}

// 	constructor() {
// 		super();

// 		this.set_named_outputs([new TypedConnectionFloat('lum')]);
// 	}

// 	create_params() {
// 		this.add_param(ParamType.VECTOR, 'color', [1, 1, 1]);
// 	}
// 	set_lines() {
// 		const body_lines = [];

// 		const value = ThreeToGl.vector3(this.variable_for_input('color'));

// 		const lum = this.gl_var_name('lum');
// 		// linearToRelativeLuminance is declared in threejs common.glsl.js
// 		body_lines.push(`float ${lum} = linearToRelativeLuminance(${value})`);
// 		this.set_body_lines(body_lines);
// 	}
// }
