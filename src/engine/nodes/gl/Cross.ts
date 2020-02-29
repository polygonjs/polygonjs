// import {BaseNodeGl} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {Connection} from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';

// export class Cross extends BaseNodeGl {
// 	static type() {
// 		return 'cross';
// 	}

// 	constructor() {
// 		super();

// 		this.set_named_outputs([new Connection.Vec3(this.gl_output_name())]);
// 	}

// 	create_params() {
// 		this.add_param(ParamType.VECTOR, 'x', [0, 0, 0]);
// 		this.add_param(ParamType.VECTOR, 'y', [0, 0, 0]);
// 	}

// 	set_lines() {
// 		const body_lines = [];

// 		const x = ThreeToGl.float(this.variable_for_input('x'));
// 		const y = ThreeToGl.float(this.variable_for_input('y'));

// 		const result = this.gl_var_name(this.gl_output_name());
// 		body_lines.push(`vec3 ${result} = cross(${x}, ${y})`);
// 		this.set_body_lines(body_lines);
// 	}
// 	gl_output_name() {
// 		return 'cross';
// 	}
// }
