/**
 * a subnet input is the input of a... subnet!
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {NetworkChildNodeType} from '../../poly/NodeContext';
import {SubnetGlNode} from './Subnet';
class SubnetInputGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetInputGlParamsConfig();

export class SubnetInputGlNode extends TypedGlNode<SubnetInputGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return NetworkChildNodeType.INPUT;
	}

	override initializeNode() {
		this.io.connection_points.set_output_name_function(this._expected_output_names.bind(this));
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));

		// this.lifecycle.onAfterAdded(() => {
		// 	this._connect_to_parent_connections_controller();
		// });
	}

	override parent() {
		return super.parent() as SubnetGlNode | null;
	}

	private _expected_output_names(index: number) {
		const parent = this.parent();
		return parent?.childExpectedInputConnectionPointName(index) || `out${index}`;
	}

	protected _expected_output_types() {
		const parent = this.parent();
		return parent?.childExpectedInputConnectionPointTypes() || [];
	}

	// private _connect_to_parent_connections_controller() {
	// 	// this will make the node update its connections when the parent changes them
	// 	if (this.parent) {
	// 		this.addGraphInput(this.parent);
	// 	}
	// }

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const parent = this.parent();
		if (!parent) {
			return;
		}

		parent.setSubnetInputLines(shaders_collection_controller, this);
	}
}
