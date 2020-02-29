// import {BaseNodeGl} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {TypedConnectionFloat} from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';
// import {Definition} from './Definition/_Module';
// import DiskMethods from './Gl/disk.glsl';

// export class Disk extends BaseNodeGl {
// 	static type() {
// 		return 'disk';
// 	}

// 	constructor() {
// 		super();

// 		// this.set_inputs([
// 		// 	new GlDataIONumeric('in')
// 		// ])
// 		this.set_named_outputs([new TypedConnectionFloat('float')]);
// 	}

// 	create_params() {
// 		this.add_param(ParamType.VECTOR2, 'position', [0, 0]);
// 		this.add_param(ParamType.VECTOR2, 'center', [0, 0]);
// 		this.add_param(ParamType.FLOAT, 'radius', 1);
// 		this.add_param(ParamType.FLOAT, 'feather', 0.1);
// 	}
// 	set_lines() {
// 		// const function_declaration_lines = []
// 		const body_lines = [];

// 		const position = ThreeToGl.vector2(this.variable_for_input('position'));
// 		const center = ThreeToGl.vector2(this.variable_for_input('center'));
// 		const radius = ThreeToGl.float(this.variable_for_input('radius'));
// 		const feather = ThreeToGl.float(this.variable_for_input('feather'));

// 		const float = this.gl_var_name('float');
// 		body_lines.push(`float ${float} = disk(${position}, ${center}, ${radius}, ${feather})`);
// 		// this.set_function_declaration_lines(function_declaration_lines)
// 		this.set_body_lines(body_lines);

// 		this.add_definitions([new Definition.Function(this, DiskMethods)]);
// 	}
// }
