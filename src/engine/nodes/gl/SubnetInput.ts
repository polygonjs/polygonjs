import {TypedGlNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {IfThenGlNode} from './IfThen';
import {NetworkChildNodeType} from '../../poly/NodeContext';
import {ThreeToGl} from '../../../core/ThreeToGl';
class SubnetInputGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetInputGlParamsConfig();

export class SubnetInputGlNode extends TypedGlNode<SubnetInputGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return NetworkChildNodeType.INPUT;
	}

	initialize_node() {
		this.io.connection_points.set_output_name_function(this._expected_output_names.bind(this));
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));

		this.lifecycle.add_on_add_hook(() => {
			this._connect_to_parent_connections_controller();
		});
	}

	get parent() {
		return super.parent as IfThenGlNode | null;
	}

	protected _expected_output_types() {
		const parent = this.parent;
		return parent?.child_subnet_input_expected_output_types() || [];
	}

	private _expected_output_names(index: number) {
		const parent = this.parent;
		return parent?.child_subnet_input_expected_output_name(index) || `out${index}`;
	}

	private _connect_to_parent_connections_controller() {
		// this will make the node update its connections when the parent changes them
		if (this.parent) {
			this.add_graph_input(this.parent);
		}
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		if (!this.parent) {
			return;
		}

		const body_lines: string[] = [];

		const connections = this.parent.io.connections.input_connections();
		if (connections) {
			for (let connection of connections) {
				if (connection) {
					// if under an if_then node
					if (connection.input_index != 0) {
						const connection_point = connection.dest_connection_point();
						const in_value = ThreeToGl.any(this.parent.variable_for_input(connection_point.name));
						const gl_type = connection_point.type;
						const out = this.gl_var_name(connection_point.name);
						const body_line = `${gl_type} ${out} = ${in_value}`;
						body_lines.push(body_line);
					}
				}
			}
		}

		shaders_collection_controller.add_body_lines(this, body_lines);
	}
}
