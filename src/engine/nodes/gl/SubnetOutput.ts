/**
 * a subnet output is the output of a... subnet!
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NetworkChildNodeType} from '../../poly/NodeContext';
import {SubnetGlNode} from './Subnet';
class SubnetOutputGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetOutputGlParamsConfig();

export class SubnetOutputGlNode extends TypedGlNode<SubnetOutputGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<NetworkChildNodeType.OUTPUT> {
		return NetworkChildNodeType.OUTPUT;
	}

	override initializeNode() {
		this.io.connection_points.set_input_name_function(this._expected_input_name.bind(this));
		this.io.connection_points.set_expected_output_types_function(() => []);
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_create_spare_params_from_inputs(false);

		this.addPostDirtyHook('setParentDirty', () => {
			this.parent()?.setDirty(this);
		});
	}
	override parent() {
		return super.parent() as SubnetGlNode | null;
	}

	protected _expected_input_name(index: number) {
		const parent = this.parent();
		return parent?.childExpectedOutputConnectionPointName(index) || `in${index}`;
	}

	protected _expected_input_types() {
		const parent = this.parent();
		return parent?.childExpectedOutputConnectionPointTypes() || [];
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const parent = this.parent();
		return parent?.setSubnetOutputLines(shadersCollectionController, this) || [];
	}
}
