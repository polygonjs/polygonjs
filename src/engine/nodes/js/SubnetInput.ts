/**
 * a subnet input is the input of a... subnet!
 *
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NetworkChildNodeType} from '../../poly/NodeContext';
import {SubnetJsNode} from './Subnet';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
class SubnetInputJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetInputJsParamsConfig();

export class SubnetInputJsNode extends TypedJsNode<SubnetInputJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return NetworkChildNodeType.INPUT;
	}

	override initializeNode() {
		this.io.connection_points.set_output_name_function(this._expectedOutputNames.bind(this));
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));

		// this.lifecycle.onAfterAdded(() => {
		// 	this._connect_to_parent_connections_controller();
		// });
	}

	override parent() {
		return super.parent() as SubnetJsNode | null;
	}

	private _expectedOutputNames(index: number) {
		const parent = this.parent();
		return parent?.childExpectedInputConnectionPointName(index) || `out${index}`;
	}

	protected _expectedOutputTypes() {
		const parent = this.parent();
		return parent?.childExpectedInputConnectionPointTypes() || [];
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const subnetParent = this.parent() as SubnetJsNode;
		const outputTypes = this._expectedOutputTypes();
		let i = 0;

		for (let _ of outputTypes) {
			const inputName = subnetParent.inputNameForSubnetInput(i);
			const inputValue = subnetParent.variableForInput(shadersCollectionController, inputName);
			const dataType = this._expectedOutputTypes()[0];
			const varName = this.jsVarName(inputName);
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
	// 	return this.parent()?.inputValueForSubnetInput(context, outputName);
	// }
}
