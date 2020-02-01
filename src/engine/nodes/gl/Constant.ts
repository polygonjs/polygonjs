import {TypedGlNode} from './_Base';
import {
	VAR_TYPES,
	TYPED_CONNECTION_BY_VAR_TYPE,
	TypedConnectionFloat,
	TypedConnectionVec2,
	TypedConnectionVec3,
	TypedConnectionVec4,
} from './GlData';
import {ThreeToGl} from 'src/core/ThreeToGl';

const OUTPUT_NAME = 'value';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import {GLDataType, GLDataTypes} from '../utils/NodeConnection';
class ConstantGlSopParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: GLDataTypes.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	value_float = ParamConfig.FLOAT(0, ConstantGlSopNode.typed_visible_options(GLDataType.FLOAT));
	value_vec2 = ParamConfig.VECTOR2([0, 0], ConstantGlSopNode.typed_visible_options(GLDataType.VEC2));
	value_vec3 = ParamConfig.VECTOR3([0, 0, 0], ConstantGlSopNode.typed_visible_options(GLDataType.VEC3));
	value_vec4 = ParamConfig.VECTOR4([0, 0, 0, 0], ConstantGlSopNode.typed_visible_options(GLDataType.VEC4));
}
const ParamsConfig = new ConstantGlSopParamsConfig();

export class ConstantGlSopNode extends TypedGlNode<ConstantGlSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'constant';
	}

	initialize_node() {
		this.io.outputs.set_named_outputs([new TypedConnectionFloat(OUTPUT_NAME)]);
		this.add_post_dirty_hook(this._update_signature_if_required.bind(this));
	}
	_update_signature_if_required(dirty_trigger?: CoreGraphNode) {
		if (dirty_trigger == this.p.type) {
			this.update_output_type();
			this.remove_dirty_state();
			this.make_output_nodes_dirty();
		}
	}

	static typed_visible_options(type: GLDataType) {
		const val = GLDataTypes.indexOf(type);
		return {visible_if: {type: val}};
	}

	set_lines() {
		const body_lines = [];

		// const constant_name = `POLY_CONSTANT_${this.pv.name}`
		const type_name = VAR_TYPES[this.pv.type];
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
		const val = this.pv.type;
		const name = GLDataTypes[val];
		const constructor = TYPED_CONNECTION_BY_VAR_TYPE[name];
		const named_output = new constructor(OUTPUT_NAME);
		this.set_named_outputs([named_output]);
	}
}
