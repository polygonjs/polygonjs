import {TypedGlNode} from './_Base';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import {
	ConnectionPointTypes,
	ConnectionPointType,
	ConnectionPointInitValueMap,
	ConnectionPointTypeToParamTypeMap,
} from '../utils/connections/ConnectionPointType';
import lodash_isArray from 'lodash/isArray';
// import {
// 	VAR_TYPES,
// 	TYPED_CONNECTION_BY_VAR_TYPE,
// 	TypedConnectionFloat,
// 	TypedConnectionVec2,
// 	TypedConnectionVec3,
// 	TypedConnectionVec4,
// } from './utils/GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';
// import {Definition} from './Definition/_Module';

// const PARAM_TYPES = {
// 	float: ParamType.FLOAT,
// 	vec2: ParamType.VECTOR2,
// 	vec3: ParamType.VECTOR,
// 	vec4: ParamType.VECTOR4,
// };
// const PARAM_DEFAULT_VALUES = {
// 	float: 0,
// 	vec2: [0, 0],
// 	vec3: [0, 0, 0],
// 	vec4: [0, 0, 0, 0],
// };

const OUTPUT_NAME = 'param_val';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {ParamType} from 'src/engine/poly/ParamType';
import {UniformGLDefinition} from './utils/GLDefinition';
class ParamGlParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: ConnectionPointTypes.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	as_color = ParamConfig.BOOLEAN(0, {
		visible_if: {type: ConnectionPointTypes.indexOf(ConnectionPointType.VEC3)},
	});
}
const ParamsConfig = new ParamGlParamsConfig();

export class ParamGlNode extends TypedGlNode<ParamGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'param';
	}

	private _update_if_type_changed_bound = this._update_if_type_changed.bind(this);
	initialize_node() {
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
		this.update_output_type();

		this.add_post_dirty_hook(this._update_if_type_changed_bound);
	}
	private _update_if_type_changed(dirty_trigger?: CoreGraphNode) {
		if (dirty_trigger == this.p.type) {
			this.update_output_type();
			this.remove_dirty_state();
			this.make_output_nodes_dirty();
		}
	}

	set_lines() {
		const definitions = [];

		const gl_type = ConnectionPointTypes[this.pv.type];
		const var_name = this.uniform_name();

		definitions.push(new UniformGLDefinition(this, gl_type, var_name)); //(`uniform ${gl_type} ${var_name}`)
		this.set_definitions(definitions);
	}
	set_param_configs() {
		const gl_type = ConnectionPointTypes[this.pv.type];
		const default_value = ConnectionPointInitValueMap[gl_type];
		let param_type = ConnectionPointTypeToParamTypeMap[gl_type];
		if (
			param_type == ParamType.VECTOR3 &&
			this.p.as_color.value &&
			lodash_isArray(default_value) &&
			default_value.length == 3
		) {
			this.add_param_config(ParamType.COLOR, this.pv.name, default_value, this.uniform_name());
		} else {
			this.add_param_config(param_type, this.pv.name, default_value, this.uniform_name());
		}
	}
	uniform_name() {
		const output_connection_point = this.io.outputs.named_output_connection_points[0];
		const var_name = this.gl_var_name(output_connection_point.name);
		return var_name;
	}

	update_output_type() {
		// const val = this.pv.type
		// const name = VAR_TYPES[val];
		// const constructor = TYPED_CONNECTION_BY_VAR_TYPE[name];
		// const named_output = new constructor(OUTPUT_NAME);
		// this.set_named_outputs([named_output]);
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME, ConnectionPointTypes[this.pv.type]),
		]);
	}
}
