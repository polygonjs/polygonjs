import {TypedGlNode, BaseGlNodeType} from './_Base';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NetworkChildNodeType} from '../../poly/NodeContext';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {SubnetGlNode} from './Subnet';
class SubnetOutputGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetOutputGlParamsConfig();

export class SubnetOutputGlNode extends TypedGlNode<SubnetOutputGlParamsConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<NetworkChildNodeType.OUTPUT> {
		return NetworkChildNodeType.OUTPUT;
	}

	initializeNode() {
		this.io.connection_points.set_input_name_function(this._expected_input_name.bind(this));
		this.io.connection_points.set_expected_output_types_function(() => []);
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_create_spare_params_from_inputs(false);

		this.addPostDirtyHook('setParentDirty', () => {
			this.parent()?.setDirty(this);
		});
	}
	parent() {
		return super.parent() as SubnetGlNode | null;
	}

	protected _expected_input_name(index: number) {
		const parent = this.parent();
		return parent?.child_expected_output_connection_point_name(index) || `in${index}`;
	}

	protected _expected_input_types() {
		const parent = this.parent();
		return parent?.child_expected_output_connection_point_types() || [];
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const parent = this.parent();
		if (!parent) {
			return;
		}
		const body_lines: string[] = [];

		const connections = this.io.connections.inputConnections();
		if (connections) {
			for (let connection of connections) {
				if (connection) {
					const connection_point = connection.dest_connection_point();

					const in_value = ThreeToGl.any(this.variable_for_input(connection_point.name()));
					// const gl_type = connection_point.type;
					const out = (parent as BaseGlNodeType).gl_var_name(connection_point.name());
					// const body_line = `${gl_type} ${out} = ${in_value}`;
					// do not use the type, to avoid re-defining a variable that should be defined in the parent node
					const body_line = `	${out} = ${in_value}`;
					body_lines.push(body_line);
				}
			}
		}

		shaders_collection_controller.add_body_lines(this, body_lines);
		parent.set_lines_block_end(shaders_collection_controller, this);
	}
}
