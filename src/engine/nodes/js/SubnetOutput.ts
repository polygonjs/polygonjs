/**
 * a subnet output is the output of a... subnet!
 *
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NetworkChildNodeType} from '../../poly/NodeContext';
import {SubnetJsNode} from './Subnet';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
class SubnetOutputJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetOutputJsParamsConfig();

export class SubnetOutputJsNode extends TypedJsNode<SubnetOutputJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<NetworkChildNodeType.OUTPUT> {
		return NetworkChildNodeType.OUTPUT;
	}

	override initializeNode() {
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_expected_output_types_function(() => []);
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_create_spare_params_from_inputs(false);
	}
	override parent() {
		return super.parent() as SubnetJsNode | null;
	}

	protected _expectedInputName(index: number) {
		const parent = this.parent();
		return parent?.childExpectedOutputConnectionPointName(index) || `in${index}`;
	}

	protected _expectedInputTypes() {
		const parent = this.parent();
		return parent?.childExpectedOutputConnectionPointTypes() || [];
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const inputTypes = this._expectedInputTypes();
		let i = 0;

		const subnetParent = this.parent() as SubnetJsNode;
		for (let _ of inputTypes) {
			const inputName = this._expectedInputName(i);
			const inputValue = this.variableForInput(shadersCollectionController, inputName);
			const dataType = this._expectedInputTypes()[0];
			const varName = subnetParent.jsVarName(subnetParent.outputNameForSubnetOutput(i) || '');
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType,
					varName,
					value: inputValue,
				},
			]);
			i++;
		}
	}

	// public override outputValue(context: JsNodeTriggerContext, outputName: string) {
	// 	return this._inputValue<JsConnectionPointType>(outputName, context) || 0;
	// }
}
