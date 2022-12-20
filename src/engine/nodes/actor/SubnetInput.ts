/**
 * a subnet input is the input of a... subnet!
 *
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NetworkChildNodeType} from '../../poly/NodeContext';
import {SubnetActorNode} from './Subnet';
class SubnetInputActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetInputActorParamsConfig();

export class SubnetInputActorNode extends TypedActorNode<SubnetInputActorParamsConfig> {
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
		return super.parent() as SubnetActorNode | null;
	}

	private _expected_output_names(index: number) {
		const parent = this.parent();
		return parent?.childExpectedInputConnectionPointName(index) || `out${index}`;
	}

	protected _expected_output_types() {
		const parent = this.parent();
		return parent?.childExpectedInputConnectionPointTypes() || [];
	}

	public override outputValue(context: ActorNodeTriggerContext, outputName: string) {
		return this.parent()?.inputValueForSubnetInput(context, outputName);
	}
}
