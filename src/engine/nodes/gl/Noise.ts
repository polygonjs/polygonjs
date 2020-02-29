// import lodash_times from 'lodash/times';
// import lodash_range from 'lodash/range';
// import lodash_clone from 'lodash/clone';
// import lodash_isArray from 'lodash/isArray';
// import {BaseNodeGl} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {Connection, COMPONENTS_COUNT_BY_TYPE} from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';
// import {Definition} from './Definition/_Module';

// // https://github.com/stegu/webgl-noise/
// import NoiseCommon from './Gl/noise/common.glsl';
// // import cellular2D from './Gl/noise/cellular2D.glsl'
// // import cellular2x2 from './Gl/noise/cellular2x2.glsl'
// // import cellular2x2x2 from './Gl/noise/cellular2x2x2.glsl'
// // import cellular3D from './Gl/noise/cellular3D.glsl'
// import classicnoise2D from './Gl/noise/classicnoise2D.glsl';
// import classicnoise3D from './Gl/noise/classicnoise3D.glsl';
// import classicnoise4D from './Gl/noise/classicnoise4D.glsl';
// import noise2D from './Gl/noise/noise2D.glsl';
// import noise3D from './Gl/noise/noise3D.glsl';
// // import noise3Dgrad from './Gl/noise/noise3Dgrad.glsl'
// import noise4D from './Gl/noise/noise4D.glsl';
// // import psrdnoise2D from './Gl/noise/psrdnoise2D.glsl'

// const IMPORT_BY_NOISE_NAME = {
// 	// 'cellular2D': cellular2D,
// 	// 'cellular2x2': cellular2x2,
// 	// 'cellular2x2x2': cellular2x2x2,
// 	// 'cellular3D': cellular3D,
// 	'Classic Perlin 2D': classicnoise2D,
// 	// 'Classic Perlin 2D with periodic variant': classicnoise2D,
// 	'Classic Perlin 3D': classicnoise3D,
// 	// 'Classic Perlin 3D with periodic variant': classicnoise3D,
// 	'Classic Perlin 4D': classicnoise4D,
// 	// 'Classic Perlin 4D with periodic variant': classicnoise4D,
// 	noise2D: noise2D,
// 	noise3D: noise3D,
// 	// 'noise3Dgrad': noise3Dgrad,
// 	noise4D: noise4D,
// 	// 'Periodic Simplex Rotating Derivative': psrdnoise2D,
// 	// 'Periodic Simplex Derivative': psrdnoise2D,
// 	// 'Periodic Simplex Rotating': psrdnoise2D,
// 	// 'Periodic Simplex': psrdnoise2D,
// 	// 'Simplex Rotating Derivating': psrdnoise2D,
// 	// 'Simplex Derivating': psrdnoise2D,
// 	// 'Simplex Rotating': psrdnoise2D,
// 	// 'Simplex': psrdnoise2D,
// };
// const INPUT_TYPES_BY_NOISE_NAME = {
// 	cellular2D: Connection.Vec2,
// 	cellular2x2: Connection.Vec2,
// 	cellular2x2x2: Connection.Vec3,
// 	cellular3D: Connection.Vec3,
// 	classicnoise2D: classicnoise2D,
// 	'Classic Perlin 2D': Connection.Vec2,
// 	'Classic Perlin 2D with periodic variant': [{position: Connection.Vec2}, {rep: Connection.Vec2}],
// 	'Classic Perlin 3D': Connection.Vec3,
// 	'Classic Perlin 3D with periodic variant': [{position: Connection.Vec3}, {rep: Connection.Vec3}],
// 	'Classic Perlin 4D': Connection.Vec4,
// 	'Classic Perlin 4D with periodic variant': [{position: Connection.Vec4}, {rep: Connection.Vec4}],
// 	noise2D: Connection.Vec2,
// 	noise3D: Connection.Vec3,
// 	noise3Dgrad: [{position: Connection.Vec3}, {gradient: Connection.Vec3}],
// 	noise4D: Connection.Vec4,
// 	'Periodic Simplex Rotating Derivative': [
// 		{position: Connection.Vec2},
// 		{per: Connection.Vec2},
// 		{rot: Connection.Float},
// 	],
// 	'Periodic Simplex Derivative': [{position: Connection.Vec2}, {per: Connection.Vec2}],
// 	'Periodic Simplex Rotating': [{position: Connection.Vec2}, {per: Connection.Vec2}, {rot: Connection.Float}],
// 	'Periodic Simplex': [{position: Connection.Vec2}, {per: Connection.Vec2}],
// 	'Simplex Rotating Derivating': [{position: Connection.Vec2}, {rot: Connection.Float}],
// 	'Simplex Derivating': [{position: Connection.Vec2}],
// 	'Simplex Rotating': [{position: Connection.Vec2}, {rot: Connection.Float}],
// 	Simplex: [{position: Connection.Vec2}],
// };

// const OUTPUT_TYPE_BY_NOISE_NAME = {
// 	// 'cellular2D': Connection.Vec2, // x
// 	// 'cellular2x2': Connection.Vec2, // x
// 	// 'cellular2x2x2': Connection.Vec2, // x
// 	// 'cellular3D': Connection.Vec2, // x
// 	'Classic Perlin 2D': Connection.Float,
// 	// 'Classic Perlin 2D with periodic variant': Connection.Float, // x
// 	'Classic Perlin 3D': Connection.Float,
// 	// 'Classic Perlin 3D with periodic variant': Connection.Float, // x
// 	'Classic Perlin 4D': Connection.Float,
// 	// 'Classic Perlin 4D with periodic variant': Connection.Float, // x
// 	noise2D: Connection.Float,
// 	noise3D: Connection.Float,
// 	// 'noise3Dgrad': Connection.Float, // x
// 	noise4D: Connection.Float,
// 	// 'Periodic Simplex Rotating Derivative': Connection.Vec3,
// 	// 'Periodic Simplex Derivative': Connection.Vec3,
// 	// 'Periodic Simplex Rotating': Connection.Float,// x
// 	// 'Periodic Simplex': Connection.Float,// x
// 	// 'Simplex Rotating Derivating': Connection.Vec3,
// 	// 'Simplex Derivating': Connection.Vec3,
// 	// 'Simplex Rotating': Connection.Float,// x
// 	// 'Simplex': Connection.Float,// x
// };
// const METHOD_NAMES_BY_NOISE_NAME = {
// 	cellular2D: 'cellular',
// 	cellular2x2: 'cellular2x2',
// 	cellular2x2x2: 'cellular2x2x2',
// 	cellular3D: 'cellular',
// 	'Classic Perlin 2D': 'cnoise',
// 	'Classic Perlin 2D with periodic variant': 'pnoise',
// 	'Classic Perlin 3D': 'cnoise',
// 	'Classic Perlin 3D with periodic variant': 'pnoise',
// 	'Classic Perlin 4D': 'cnoise',
// 	'Classic Perlin 4D with periodic variant': 'pnoise',
// 	noise2D: 'snoise',
// 	noise3D: 'snoise',
// 	noise3Dgrad: 'snoise',
// 	noise4D: 'snoise',
// 	'Periodic Simplex Rotating Derivative': 'psrdnoise',
// 	'Periodic Simplex Derivative': 'psdnoise',
// 	'Periodic Simplex Rotating': 'psrnoise',
// 	'Periodic Simplex': 'psnoise',
// 	'Simplex Rotating Derivating': 'srdnoise',
// 	'Simplex Derivating': 'sdnoise',
// 	'Simplex Rotating': 'srnoise',
// 	Simplex: 'snoise',
// };
// const NOISE_NAMES = [
// 	// 'cellular2D',
// 	// 'cellular2x2',
// 	// 'cellular2x2x2',
// 	// 'cellular3D',
// 	'Classic Perlin 2D',
// 	// 'Classic Perlin 2D with periodic variant',
// 	'Classic Perlin 3D',
// 	// 'Classic Perlin 3D with periodic variant',
// 	'Classic Perlin 4D',
// 	// 'Classic Perlin 4D with periodic variant',
// 	'noise2D',
// 	'noise3D',
// 	// 'noise3Dgrad',
// 	'noise4D',
// 	// 'Periodic Simplex Rotating Derivative', // psrdnoise
// 	// 'Periodic Simplex Derivative', // psdnoise
// 	// 'Periodic Simplex Rotating', // psrnoise
// 	// 'Periodic Simplex', // psnoise
// 	// 'Simplex Rotating Derivating', // srdnoise
// 	// 'Simplex Derivating', // sdnoise
// 	// 'Simplex Rotating', // srnoise
// 	// 'Simplex', // snoise
// ];

// const OUTPUT_TYPES = {
// 	NoChange: 0,
// 	Float: 1,
// 	Vec2: 2,
// 	Vec3: 3,
// 	Vec4: 4,
// };
// const OUTPUT_NAMES = ['Same as noise', 'Float', 'Vec2', 'Vec3', 'Vec4'];
// const ALL_COMPONENTS = ['x', 'y', 'z', 'w'];

// export class Noise extends BaseNodeGl {
// 	static type() {
// 		return 'noise';
// 	}

// 	_param_type: number;
// 	_param_output_type: number;

// 	constructor() {
// 		super();

// 		this.set_named_outputs([new Connection.Float('noise')]);

// 		this.add_post_dirty_hook(this._update_signature_if_required.bind(this));
// 	}
// 	_update_signature_if_required(dirty_trigger) {
// 		if (dirty_trigger == this.param('type') || dirty_trigger == this.param('output_type')) {
// 			// no need to eval_p, as it won't be an expression
// 			const noise_type = this.param('type').value();
// 			const output_type = this.param('output_type').value();
// 			this.update_connection_types_from_noise_type(noise_type, output_type);
// 			this.remove_dirty_state();
// 			this.make_output_nodes_dirty();
// 		}
// 	}

// 	create_params() {
// 		const default_noise_type = Object.keys(OUTPUT_TYPE_BY_NOISE_NAME).indexOf('noise3D');
// 		const default_output_type = OUTPUT_TYPES.NoChange;
// 		this.add_param(ParamType.INTEGER, 'type', default_noise_type, {
// 			menu: {
// 				type: 'radio',
// 				entries: NOISE_NAMES.map((noise_name, i) => {
// 					const noise_output_type = OUTPUT_TYPE_BY_NOISE_NAME[noise_name].gl_type();
// 					const name = noise_name; //`${noise_name} (output: ${noise_output_type})`
// 					return {name: name, value: i};
// 				}),
// 			},
// 		});
// 		this.add_param(ParamType.INTEGER, 'output_type', default_output_type, {
// 			menu: {
// 				type: 'radio',
// 				entries: Object.keys(OUTPUT_TYPES).map((output_type) => {
// 					const val = OUTPUT_TYPES[output_type];
// 					const name = OUTPUT_NAMES[val];
// 					return {name: name, value: val};
// 				}),
// 			},
// 		});

// 		this.add_param(ParamType.INTEGER, 'octaves', 3, {range: [1, 10], range_locked: [true, false]});
// 		this.add_param(ParamType.FLOAT, 'amp_attenuation', 0.5, {range: [0, 1]});
// 		this.add_param(ParamType.FLOAT, 'freq_increase', 2, {range: [0, 10]});
// 		this.add_param(ParamType.SEPARATOR, 'separator', 1);

// 		this.update_connection_types_from_noise_type(default_noise_type, default_output_type);
// 	}
// 	inputless_params_names(): string[] {
// 		return ['octaves', 'amp_attenuation', 'freq_increase'];
// 	}
// 	// set_lines(){
// 	// 	const function_declaration_lines = []
// 	// 	const body_lines = []

// 	// 	const noise_name = NOISE_NAMES[this._param_type]
// 	// 	const method_name = METHOD_NAMES_BY_NOISE_NAME[noise_name]
// 	// 	const noise_function = IMPORT_BY_NOISE_NAME[noise_name]
// 	// 	function_declaration_lines.push(new Definition.Function(this, noise_function))

// 	// 	const amp = ThreeToGl.any(this.variable_for_input('amp'))
// 	// 	const position = ThreeToGl.any(this.variable_for_input('position'))
// 	// 	const freq = ThreeToGl.any(this.variable_for_input('freq'))
// 	// 	const offset = ThreeToGl.any(this.variable_for_input('offset'))
// 	// 	const args = [
// 	// 		`(${position}*${freq})+${offset}`
// 	// 	]

// 	// 	// add other args if required
// 	// 	const input_constructor = INPUT_TYPES_BY_NOISE_NAME[noise_name]
// 	// 	if (lodash_isArray(input_constructor)){
// 	// 		const properties = lodash_clone(input_constructor)
// 	// 		properties.shift() // remove position
// 	// 		properties.forEach(property=>{
// 	// 			const arg_name = Object.keys(property)[0]
// 	// 			const arg = ThreeToGl.any(this.variable_for_input(arg_name))
// 	// 			args.push(arg)
// 	// 		})
// 	// 	}
// 	// 	const joined_args = args.join(', ')

// 	// 	const output_gl_type = this.named_outputs()[0].type()

// 	// 	const noise = this.gl_var_name('noise')
// 	// 	body_lines.push( `${output_gl_type} ${noise} = ${amp}*${method_name}(${joined_args})` )
// 	// 	this.set_definitions(function_declaration_lines)
// 	// 	this.set_body_lines(body_lines)
// 	// }
// 	set_lines() {
// 		const function_declaration_lines = [];
// 		const body_lines = [];

// 		const noise_name = NOISE_NAMES[this._param_type];
// 		const noise_function = IMPORT_BY_NOISE_NAME[noise_name];
// 		const noise_output_gl_type = OUTPUT_TYPE_BY_NOISE_NAME[noise_name].gl_type();
// 		function_declaration_lines.push(new Definition.Function(this, NoiseCommon));
// 		function_declaration_lines.push(new Definition.Function(this, noise_function));
// 		function_declaration_lines.push(new Definition.Function(this, this.fbm_function()));

// 		const output_gl_type = this.named_outputs()[0].type();

// 		// if the requested output type matches the noise signature
// 		if (output_gl_type == noise_output_gl_type) {
// 			const line = this.single_noise_line();
// 			// body_lines.push( `${output_gl_type} ${noise} = ${amp}*${method_name}(${joined_args})` )
// 			body_lines.push(line);
// 		} else {
// 			// if the requested output type does not match the noise signature
// 			const requested_components_count = COMPONENTS_COUNT_BY_TYPE[output_gl_type];
// 			// const noise_output_components_count = OUTPUT_TYPE_BY_NOISE_NAME[output_gl_type]

// 			// console.log("compare", output_gl_type, requested_components_count, noise_output_components_count)
// 			// if(requested_components_count < noise_output_components_count){
// 			// 	// not sure we ever go through here with the current noise set
// 			// 	let component = lodash_range(requested_components_count).map(i=>ALL_COMPONENTS[i]).join('')
// 			// 	const line = this.single_noise_line('', component)
// 			// 	body_lines.push(line)
// 			// } else {
// 			const lines_count_required = requested_components_count;
// 			const assembly_args = [];
// 			const noise = this.gl_var_name('noise');
// 			lodash_times(lines_count_required, (i) => {
// 				const component = ALL_COMPONENTS[i];
// 				assembly_args.push(`${noise}${component}`);
// 				const input_constructor = INPUT_TYPES_BY_NOISE_NAME[noise_name];
// 				if (lodash_isArray(input_constructor)) {
// 					// TODO: for noise3Dgrad and other noises with 2 inputs
// 				} else {
// 					// console.log(INPUT_TYPES_BY_NOISE_NAME, noise_name)
// 					const offset_gl_type = input_constructor.gl_type();
// 					const offset_components_count = COMPONENTS_COUNT_BY_TYPE[offset_gl_type];
// 					const offset_values = lodash_range(offset_components_count)
// 						.map((j) => ThreeToGl.float(1000 * i))
// 						.join(', ');
// 					const offset2 = `${offset_gl_type}(${offset_values})`;
// 					const line = this.single_noise_line(component, component, offset2);
// 					body_lines.push(line);
// 				}
// 			});
// 			const joined_args = assembly_args.join(', ');
// 			const assembly_line = `vec${lines_count_required} ${noise} = vec${lines_count_required}(${joined_args})`;
// 			body_lines.push(assembly_line);
// 			// }
// 		}

// 		this.set_definitions(function_declaration_lines);
// 		this.set_body_lines(body_lines);
// 	}

// 	fbm_method_name() {
// 		const noise_name = NOISE_NAMES[this._param_type];
// 		const method_name = METHOD_NAMES_BY_NOISE_NAME[noise_name];
// 		return `fbm_${method_name}_${this.name()}`;
// 	}

// 	fbm_function() {
// 		const noise_name = NOISE_NAMES[this._param_type];
// 		const method_name = METHOD_NAMES_BY_NOISE_NAME[noise_name];

// 		const input_type = INPUT_TYPES_BY_NOISE_NAME[noise_name];
// 		const component_count = COMPONENTS_COUNT_BY_TYPE[input_type];
// 		const input_gl_type = input_type.gl_type();

// 		return `
// float ${this.fbm_method_name()} (in ${input_gl_type} st) {
// 	float value = 0.0;
// 	float amplitude = 1.0;
// 	for (int i = 0; i < ${ThreeToGl.int(this._param_octaves)}; i++) {
// 		value += amplitude * ${method_name}(st);
// 		st *= ${ThreeToGl.float(this._param_freq_increase)};
// 		amplitude *= ${ThreeToGl.float(this._param_amp_attenuation)};
// 	}
// 	return value;
// }
// `;
// 	}

// 	single_noise_line(output_name_suffix?: string, component?: string, offset2?: string) {
// 		const noise_name = NOISE_NAMES[this._param_type];
// 		// const method_name = METHOD_NAMES_BY_NOISE_NAME[noise_name]
// 		const method_name = this.fbm_method_name();

// 		const amp = ThreeToGl.any(this.variable_for_input('amp'));
// 		const position = ThreeToGl.any(this.variable_for_input('position'));
// 		const freq = ThreeToGl.any(this.variable_for_input('freq'));
// 		let offset = ThreeToGl.any(this.variable_for_input('offset'));
// 		if (offset2) {
// 			offset = `(${offset}+${offset2})`;
// 		}
// 		const args = [`(${position}*${freq})+${offset}`];

// 		// we cannot use amp as is in all cases
// 		// if the noise outputs a vec2 and the amp is vec3, we cannot simply do vec3*vec2
// 		// therefore, in such a case, we must only take the required component of vec3
// 		// examples:
// 		// - noise is cellular 2D (outputs vec2) and requested output is float:
// 		//		nothing to do
// 		// - noise is cellular 2D (outputs vec2) and requested output is vec2:
// 		//		nothing to do
// 		// - noise is cellular 2D (outputs vec3) and requested output is vec2:
// 		//		we have:
// 		//			x = amp.x * vec2.x
// 		//			y = amp.y * vec2.y
// 		//			z = amp.z * 0
// 		//			output = vec3(x,y,z)

// 		// add other args if required
// 		const input_constructor = INPUT_TYPES_BY_NOISE_NAME[noise_name];
// 		if (lodash_isArray(input_constructor)) {
// 			const properties = lodash_clone(input_constructor);
// 			properties.shift(); // remove position
// 			properties.forEach((property) => {
// 				const arg_name = Object.keys(property)[0];
// 				const arg = ThreeToGl.any(this.variable_for_input(arg_name));
// 				args.push(arg);
// 			});
// 		}
// 		const joined_args = args.join(', ');

// 		let output_gl_type = OUTPUT_TYPE_BY_NOISE_NAME[noise_name].gl_type(); //this.named_outputs()[0].type()

// 		const noise = this.gl_var_name('noise');
// 		const right_hand = `${amp}*${method_name}(${joined_args})`;
// 		if (component) {
// 			return `float ${noise}${output_name_suffix} = (${right_hand}).${component}`;
// 		} else {
// 			// it looks like we never go here with the current set of noises
// 			const output_gl_type = OUTPUT_TYPE_BY_NOISE_NAME[noise_name].gl_type(); //this.named_outputs()[0].type()
// 			return `${output_gl_type} ${noise} = ${right_hand}`;
// 		}
// 	}

// 	private update_connection_types_from_noise_type(noise_type: number, output_type: number) {
// 		const noise_name = NOISE_NAMES[noise_type];

// 		const noise_output_constructor = OUTPUT_TYPE_BY_NOISE_NAME[noise_name];
// 		const output_name = OUTPUT_NAMES[output_type];
// 		const requested_output_constructor = Connection[output_name] || noise_output_constructor;
// 		this.set_named_outputs([new requested_output_constructor('noise')]);

// 		const input_constructor = INPUT_TYPES_BY_NOISE_NAME[noise_name];
// 		let names_inputs_properties = [];
// 		if (lodash_isArray(input_constructor)) {
// 			const position_properties = input_constructor[0];
// 			const other_properties = lodash_clone(input_constructor);
// 			other_properties.shift(); // remove position

// 			const position_constructor = position_properties['position'];

// 			array_of_zero = lodash_range(input_constructor.length).map((i) => 0);
// 			array_of_one = lodash_range(input_constructor.length).map((i) => 1);

// 			names_inputs_properties = [
// 				{amp: requested_output_constructor, default_value: array_of_one},
// 				{position: position_constructor, default_value: array_of_zero},
// 				{freq: position_constructor, default_value: array_of_one},
// 				{offset: position_constructor, default_value: array_of_zero},
// 			].concat(other_properties);
// 		} else {
// 			names_inputs_properties = [
// 				{amp: requested_output_constructor, default_value: 1},
// 				{position: input_constructor, default_value: 0},
// 				{freq: input_constructor, default_value: 1},
// 				{offset: input_constructor, default_value: 0},
// 			];
// 		}
// 		const named_inputs = names_inputs_properties.map((property) => {
// 			const name = Object.keys(property)[0];
// 			const constructor = property[name];
// 			const named_input = new constructor(name);
// 			const default_value = property['default_value'];
// 			if (default_value) {
// 				named_input.set_default_value(default_value);
// 			}
// 			return named_input;
// 		});
// 		this.set_named_inputs(named_inputs);
// 		this._init_graph_node_inputs();
// 		this.create_spare_parameters();
// 	}
// }
