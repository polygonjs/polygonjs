// import {BaseNodeGl} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {Connection} from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';
// import {Definition} from './Definition/_Module';
// import {CoreTextureLoader} from 'src/Core/Loader/Texture';
// import {File} from 'src/Engine/Node/Cop/File';

// export class Texture extends BaseNodeGl {
// 	static type() {
// 		return 'texture';
// 	}

// 	_param_param_name: string;
// 	_param_default_value: string;

// 	constructor() {
// 		super();

// 		this.set_named_outputs([new Connection.Vec4('rgba')]);
// 	}

// 	create_params() {
// 		this.add_param(ParamType.STRING, 'param_name', 'texture_map');
// 		this.add_param(ParamType.STRING, 'default_value', File.DEFAULT_NODE_PATH.UV);
// 		this.add_param(ParamType.VECTOR2, 'uv', [0, 0]);
// 	}

// 	set_lines() {
// 		const definitions = [];
// 		const body_lines = [];

// 		const uv = ThreeToGl.vector2(this.variable_for_input('uv'));

// 		const rgba = this.gl_var_name('rgba');
// 		const map = this.uniform_name();
// 		// const rgb = this.gl_var_name('rgb')
// 		// const a = this.gl_var_name('a')
// 		definitions.push(new Definition.Uniform(this, 'sampler2D', map)); //(`uniform sampler2D ${map}`)
// 		body_lines.push(`vec4 ${rgba} = texture2D(${map}, ${uv})`);
// 		this.set_definitions(definitions);
// 		this.set_body_lines(body_lines);
// 	}

// 	set_param_configs() {
// 		this.add_param_config(
// 			ParamType.OPERATOR_PATH,
// 			this._param_param_name,
// 			this._param_default_value,
// 			this.uniform_name()
// 		);
// 	}
// 	uniform_name() {
// 		// return 'uMapTest'
// 		return this.gl_var_name(this._param_param_name);
// 	}
// }
