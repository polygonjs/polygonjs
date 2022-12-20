/**
 * a subnet output is the output of a... subnet!
 *
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NetworkChildNodeType} from '../../poly/NodeContext';
import {SubnetActorNode} from './Subnet';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
class SubnetOutputActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetOutputActorParamsConfig();

export class SubnetOutputActorNode extends TypedActorNode<SubnetOutputActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<NetworkChildNodeType.OUTPUT> {
		return NetworkChildNodeType.OUTPUT;
	}

	override initializeNode() {
		this.io.connection_points.set_input_name_function(this._expected_input_name.bind(this));
		this.io.connection_points.set_expected_output_types_function(() => []);
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_create_spare_params_from_inputs(false);
	}
	override parent() {
		return super.parent() as SubnetActorNode | null;
	}

	protected _expected_input_name(index: number) {
		const parent = this.parent();
		return parent?.childExpectedOutputConnectionPointName(index) || `in${index}`;
	}

	protected _expected_input_types() {
		const parent = this.parent();
		return parent?.childExpectedOutputConnectionPointTypes() || [];
	}

	public override outputValue(context: ActorNodeTriggerContext, outputName: string) {
		return this._inputValue<ActorConnectionPointType>(outputName, context) || 0;
	}
}
