import {TypedGlNode} from './_Base';
import {ThreeToGl} from 'src/core/ThreeToGl';

const OUTPUT_NAME = 'value';

import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType, ConnectionPointTypes} from '../utils/connections/ConnectionPointType';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';

function typed_visible_options(type: ConnectionPointType) {
	const val = ConnectionPointTypes.indexOf(type);
	return {visible_if: {type: val}};
}

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class ConstantGlParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: ConnectionPointTypes.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	value_float = ParamConfig.FLOAT(0, typed_visible_options(ConnectionPointType.FLOAT));
	value_vec2 = ParamConfig.VECTOR2([0, 0], typed_visible_options(ConnectionPointType.VEC2));
	value_vec3 = ParamConfig.VECTOR3([0, 0, 0], typed_visible_options(ConnectionPointType.VEC3));
	value_vec4 = ParamConfig.VECTOR4([0, 0, 0, 0], typed_visible_options(ConnectionPointType.VEC4));
}
const ParamsConfig = new ConstantGlParamsConfig();
export class ConstantGlNode extends TypedGlNode<ConstantGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'constant';
	}

	private _update_signature_if_required_bound = this._update_signature_if_required.bind(this);
	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME, ConnectionPointType.FLOAT),
		]);
		this.add_post_dirty_hook('_update_signature_if_required', this._update_signature_if_required_bound);
	}
	_update_signature_if_required(dirty_trigger?: CoreGraphNode) {
		if (dirty_trigger == this.p.type) {
			this.update_output_type();
			this.remove_dirty_state();
			this.make_output_nodes_dirty();
		}
	}

	// create_params() {
	// 	this.add_param( ParamType.INTEGER, 'type', 0, {
	// 		menu: {
	// 			type: 'radio',
	// 			entries: VAR_TYPES.map((name, i)=>{
	// 				return {name: name, value: i}
	// 			})
	// 		}
	// 	} )

	// 	// this.add_param( ParamType.FLOAT, 'value_float', 0, this._typed_visible_options('float') )
	// 	// this.add_param( ParamType.VECTOR2, 'value_vec2', [0,0], this._typed_visible_options('vec2') )
	// 	// this.add_param( ParamType.VECTOR, 'value_vec3', [0,0,0], this._typed_visible_options('vec3') )
	// 	// this.add_param( ParamType.VECTOR4, 'value_vec4', [0,0,0,0], this._typed_visible_options('vec4') )
	// }

	set_lines() {
		const body_lines = [];

		// const constant_name = `POLY_CONSTANT_${this._param_name}`
		const type_name = ConnectionPointTypes[this.pv.type];
		const param_name = `value_${type_name}`;
		const param = this.params.get(param_name);
		if (param) {
			const value = ThreeToGl.any(param.value);
			const var_value = this.gl_var_name(OUTPUT_NAME);
			body_lines.push(`${type_name} ${var_value} = ${value}`);
			this.set_body_lines(body_lines);
		}
	}

	create_inputs_from_params() {}

	update_output_type() {
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME, ConnectionPointTypes[this.pv.type]),
		]);
		// const val = this.param('type').value() // no need to eval_p, as it won't be an expression
		// const name = VAR_TYPES[val]
		// const constructor = TYPED_CONNECTION_BY_VAR_TYPE[name]
		// const named_output = new constructor(OUTPUT_NAME)
		// this.set_named_outputs([
		// 	named_output
		// ])
	}
}
