import {TypedGlNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {NetworkChildNodeType} from '../../poly/NodeContext';
import {SubnetGlNode} from './Subnet';
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

		// this.lifecycle.add_on_add_hook(() => {
		// 	this._connect_to_parent_connections_controller();
		// });
	}

	get parent() {
		return super.parent as SubnetGlNode | null;
	}

	private _expected_output_names(index: number) {
		const parent = this.parent;
		return parent?.child_expected_input_connection_point_name(index) || `out${index}`;
	}

	protected _expected_output_types() {
		const parent = this.parent;
		return parent?.child_expected_input_connection_point_types() || [];
	}

	// private _connect_to_parent_connections_controller() {
	// 	// this will make the node update its connections when the parent changes them
	// 	if (this.parent) {
	// 		this.addGraphInput(this.parent);
	// 	}
	// }

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		if (!this.parent) {
			return;
		}

		this.parent.set_lines_block_start(shaders_collection_controller, this);
	}
}
