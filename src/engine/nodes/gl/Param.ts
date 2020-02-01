
import {BaseNodeGl} from './_Base';
import {ParamType} from 'src/Engine/Param/_Module';
import {
	VAR_TYPES,
	TYPED_CONNECTION_BY_VAR_TYPE,
	TypedConnectionFloat,
	TypedConnectionVec2,
	TypedConnectionVec3,
	TypedConnectionVec4
} from './GlData'
import {ThreeToGl} from 'src/Core/ThreeToGl'
import {Definition} from './Definition/_Module'

const PARAM_TYPES = {
	float: ParamType.FLOAT,
	vec2: ParamType.VECTOR2,
	vec3: ParamType.VECTOR,
	vec4: ParamType.VECTOR4
}
const PARAM_DEFAULT_VALUES = {
	float: 0,
	vec2: [0,0],
	vec3: [0,0,0],
	vec4: [0,0,0,0]
}

const OUTPUT_NAME = 'param_val'

export class Param extends BaseNodeGl {
	static type() { return 'param'; }

	_param_name: string
	_param_type: number

	constructor() {
		super();

		// this.set_inputs([
		// 	new GlDataIONumeric('in')
		// ])
		// this.set_outputs([
		// 	new GlDataIO('out')
		// ])
		// this.set_named_outputs([
		// 	new TypedConnectionFloat('float'),
		// 	new TypedConnectionVec2('vec2'),
		// 	new TypedConnectionVec3('vec3'),
		// 	new TypedConnectionVec4('vec4')
		// ])
		this.set_named_outputs([
			new TypedConnectionFloat(OUTPUT_NAME)
		])

		this.add_post_dirty_hook(this._update_if_type_changed.bind(this))
	}
	_update_if_type_changed(dirty_trigger){
		if(dirty_trigger == this.param('type')){
			this.update_output_type()
			this.remove_dirty_state()
			this.make_output_nodes_dirty()
		}
	}
	create_params() {
		this.add_param( ParamType.STRING, 'name', '' )
		this.add_param( ParamType.INTEGER, 'type', 0, {
			menu: {
				type: 'radio',
				entries: VAR_TYPES.map((name, i)=>{
					return {name: name, value: i}
				})
			}
		})
		this.add_param( ParamType.TOGGLE, 'as_color', 0, {
			visible_if: {type: VAR_TYPES.indexOf('vec3')}
		} )
	}

	set_lines(){
		const definitions = []

		const gl_type = VAR_TYPES[this._param_type]
		const var_name = this.uniform_name()

		definitions.push(new Definition.Uniform(this, gl_type, var_name)) //(`uniform ${gl_type} ${var_name}`)
		this.set_definitions(definitions)
	}
	set_param_configs(){
		const gl_type = VAR_TYPES[this._param_type]
		const default_value = PARAM_DEFAULT_VALUES[gl_type]
		let param_type = PARAM_TYPES[gl_type]
		if(param_type == ParamType.VECTOR && this.param('as_color').value()){
			param_type = ParamType.COLOR
		}

		this.add_param_config(
			param_type,
			this._param_name,
			default_value,
			this.uniform_name()
		)
	}
	uniform_name(){
		const named_output = this.named_outputs()[0]
		const var_name = this.gl_var_name(named_output.name())
		return var_name
	}


	update_output_type(){
		const val = this.param('type').value() // no need to eval_p, as it won't be an expression
		const name = VAR_TYPES[val]
		const constructor = TYPED_CONNECTION_BY_VAR_TYPE[name]
		const named_output = new constructor(OUTPUT_NAME)
		this.set_named_outputs([
			named_output
		])
	}
}
