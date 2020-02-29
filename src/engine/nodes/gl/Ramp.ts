// import {BaseNodeGl} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {
// 	VAR_TYPES,
// 	TYPED_CONNECTION_BY_VAR_TYPE,
// 	TypedConnectionFloat,
// 	TypedConnectionVec2,
// 	TypedConnectionVec3,
// 	TypedConnectionVec4,
// } from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';
// import {Definition} from './Definition/_Module';

// import {Ramp} from 'src/Engine/Param/Ramp';
// const RampParam = Ramp;

// // const PARAM_TYPES = {
// // 	float: ParamType.FLOAT,
// // 	vec2: ParamType.VECTOR2,
// // 	vec3: ParamType.VECTOR,
// // 	vec4: ParamType.VECTOR4
// // }
// // const PARAM_DEFAULT_VALUES = {
// // 	float: 0,
// // 	vec2: [0,0],
// // 	vec3: [0,0,0],
// // 	vec4: [0,0,0,0]
// // }

// const OUTPUT_NAME = 'ramp_val';

// export class RampGl extends BaseNodeGl {
// 	static type() {
// 		return 'ramp';
// 	}

// 	constructor() {
// 		super();

// 		this.set_named_outputs([new TypedConnectionFloat(OUTPUT_NAME)]);
// 	}

// 	create_params() {
// 		this.add_param(ParamType.STRING, 'name', 'ramp');
// 		this.add_param(ParamType.FLOAT, 'input', 0);
// 	}

// 	set_lines() {
// 		const definitions = [];

// 		const gl_type = 'float';
// 		const texture_name = this.uniform_name();
// 		const named_output = this.named_outputs()[0];
// 		const var_name = this.gl_var_name(named_output.name());

// 		definitions.push(new Definition.Uniform(this, 'sampler2D', texture_name)); //(`uniform ${gl_type} ${var_name}`)
// 		this.set_definitions(definitions);

// 		const input_val = this.variable_for_input('input');
// 		this.set_body_lines([`${gl_type} ${var_name} = texture2D(${this.uniform_name()}, vec2(${input_val}, 0.0)).x`]);
// 	}
// 	set_param_configs() {
// 		const default_value = RampParam.DEFAULT_VALUE;
// 		this.add_param_config(ParamType.RAMP, this._param_name, default_value, this.uniform_name());
// 	}
// 	uniform_name() {
// 		const named_output = this.named_outputs()[0];
// 		const var_name = 'ramp_texture_' + this.gl_var_name(named_output.name());
// 		return var_name;
// 	}

// 	// async post_set_dirty(dirty_trigger){
// 	// 	if(dirty_trigger == this.param('type')){
// 	// 		// await this.update_output_type()
// 	// 		this.remove_dirty_state()
// 	// 		this.make_output_nodes_dirty()
// 	// 	}
// 	// }
// 	// async update_output_type(){
// 	// 	this.param('type').eval_p().then(val=>{
// 	// 		const name = VAR_TYPES[val]
// 	// 		const constructor = TYPED_CONNECTION_BY_VAR_TYPE[name]
// 	// 		const named_output = new constructor(OUTPUT_NAME)
// 	// 		this.set_named_outputs([
// 	// 			named_output
// 	// 		])
// 	// 	})
// 	// }
// }
