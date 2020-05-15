import {TypedGlNode, BaseGlNodeType} from './_Base';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NetworkChildNodeType} from '../../poly/NodeContext';
import {ThreeToGl} from '../../../core/ThreeToGl';
class SubnetOutputGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetOutputGlParamsConfig();

export class SubnetOutputGlNode extends TypedGlNode<SubnetOutputGlParamsConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<NetworkChildNodeType.OUTPUT> {
		return NetworkChildNodeType.OUTPUT;
	}

	initialize_node() {
		this.io.connection_points.set_input_name_function(this._expected_input_name.bind(this));
		this.io.connection_points.set_expected_output_types_function(() => []);
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_create_spare_params_from_inputs(false);
	}

	protected _expected_input_name(index: number) {
		const connection = this.io.connections.input_connection(index);
		if (connection) {
			const name = connection.src_connection_point().name;
			return name;
		} else {
			return `in${index}`;
		}
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
					const type = connection.src_connection_point().type;
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

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		if (!this.parent) {
			return;
		}
		const body_lines: string[] = [];

		const connections = this.io.connections.input_connections();
		if (connections) {
			for (let connection of connections) {
				if (connection) {
					const connection_point = connection.dest_connection_point();

					const in_value = ThreeToGl.any(this.variable_for_input(connection_point.name));
					// const gl_type = connection_point.type;
					const out = (this.parent as BaseGlNodeType).gl_var_name(connection_point.name);
					// const body_line = `${gl_type} ${out} = ${in_value}`;
					// do not use the type, to avoid re-defining a variable that should be defined in the parent node
					const body_line = `${out} = ${in_value}`;
					body_lines.push(body_line);
				}
			}
		}

		shaders_collection_controller.add_body_lines(this, body_lines);
	}
}
