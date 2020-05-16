import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';

import {GlConnectionPointType, GL_CONNECTION_POINT_TYPES} from '../utils/io/connections/Gl';

function typed_visible_options(type: GlConnectionPointType) {
	const val = GL_CONNECTION_POINT_TYPES.indexOf(type);
	return {visible_if: {type: val}};
}

import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
// import {GlConnectionsController} from './utils/GLConnectionsController';

class ConstantGlParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT), {
		menu: {
			entries: GL_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	bool = ParamConfig.BOOLEAN(0, typed_visible_options(GlConnectionPointType.BOOL));
	int = ParamConfig.INTEGER(0, typed_visible_options(GlConnectionPointType.INT));
	float = ParamConfig.FLOAT(0, typed_visible_options(GlConnectionPointType.FLOAT));
	vec2 = ParamConfig.VECTOR2([0, 0], typed_visible_options(GlConnectionPointType.VEC2));
	vec3 = ParamConfig.VECTOR3([0, 0, 0], typed_visible_options(GlConnectionPointType.VEC3));
	vec4 = ParamConfig.VECTOR4([0, 0, 0, 0], typed_visible_options(GlConnectionPointType.VEC4));
}
const ParamsConfig = new ConstantGlParamsConfig();
export class ConstantGlNode extends TypedGlNode<ConstantGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'constant';
	}
	static readonly OUTPUT_NAME = 'val';
	private _params_by_type: Map<GlConnectionPointType, BaseParamType> | undefined;
	protected _allow_inputs_created_from_params: boolean = false;
	initialize_node() {
		this.io.connection_points.set_output_name_function((index: number) => ConstantGlNode.OUTPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [this._current_connection_type]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const param = this._current_param;
		if (param) {
			const connection_type = this._current_connection_type;
			const value = ThreeToGl.any(param.value);
			const var_value = this._current_var_name;
			const body_line = `${connection_type} ${var_value} = ${value}`;
			shaders_collection_controller.add_body_lines(this, [body_line]);
		} else {
			console.warn(`no param found for constant node for type '${this.pv.type}'`);
		}
	}

	private get _current_connection_type() {
		if (this.pv.type == null) {
			console.warn('constant gl node type if not valid');
		}
		const connection_type = GL_CONNECTION_POINT_TYPES[this.pv.type];
		if (connection_type == null) {
			console.warn('constant gl node type if not valid');
		}
		return connection_type;
	}

	private get _current_param(): BaseParamType {
		this._params_by_type =
			this._params_by_type ||
			new Map<GlConnectionPointType, BaseParamType>([
				[GlConnectionPointType.BOOL, this.p.bool],
				[GlConnectionPointType.INT, this.p.int],
				[GlConnectionPointType.FLOAT, this.p.float],
				[GlConnectionPointType.VEC2, this.p.vec2],
				[GlConnectionPointType.VEC3, this.p.vec3],
				[GlConnectionPointType.VEC4, this.p.vec4],
			]);
		const connection_type = GL_CONNECTION_POINT_TYPES[this.pv.type];
		return this._params_by_type.get(connection_type)!;
	}
	private get _current_var_name(): string {
		return this.gl_var_name(ConstantGlNode.OUTPUT_NAME);
	}

	set_gl_type(type: GlConnectionPointType) {
		this.p.type.set(GL_CONNECTION_POINT_TYPES.indexOf(type));
	}
}
