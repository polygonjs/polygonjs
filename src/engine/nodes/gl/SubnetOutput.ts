import {TypedGlNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
// import {GlConnectionsController} from './utils/GLConnectionsController';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
// import {IfGlNode} from './If';
class SubnetOutputGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetOutputGlParamsConfig();

export class SubnetOutputGlNode extends TypedGlNode<SubnetOutputGlParamsConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<'subnet_output'> {
		return 'subnet_output';
	}

	// public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	initialize_node() {
		// this.gl_connections_controller.set_input_name_function(this._expected_input_names.bind(this));
		this.io.connection_points.set_expected_output_types_function(() => []);
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_create_spare_params_from_inputs(false);
	}

	private _expected_inputs_count() {
		const current_connections = this.io.connections.input_connections();
		return current_connections ? Math.max(current_connections.length + 1, 1) : 1;
	}

	protected _expected_input_types() {
		const types: GlConnectionPointType[] = [];

		const default_type = GlConnectionPointType.FLOAT;
		const current_connections = this.io.connections.input_connections();

		const expected_count = this._expected_inputs_count();
		for (let i = 0; i < expected_count; i++) {
			if (current_connections) {
				const connection = current_connections[i];
				if (connection) {
					const type = this.io.connection_points.connection_point_type_from_connection(connection);
					types.push(type);
				} else {
					types.push(default_type);
				}
			} else {
				types.push(default_type);
			}
		}
		return types;
	}

	// private _expected_input_names(index: number) {
	// 	const parent = this.parent as IfGlNode;
	// 	return parent.expected_output_names(index);
	// }

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		// const definitions = [];
		// const gl_type = GL_CONNECTION_POINT_TYPES[this.pv.type];
		// const var_name = this.uniform_name();
		// definitions.push(new UniformGLDefinition(this, gl_type, var_name));
		// shaders_collection_controller.add_definitions(this, definitions);
	}
}
