import {TypedParam} from './_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';

export class ButtonParam extends TypedParam<ParamType.BUTTON> {
	static override type() {
		return ParamType.BUTTON;
	}
	override defaultValueSerialized() {
		return this._default_value;
	}
	override rawInputSerialized() {
		return this._raw_input;
	}
	override valueSerialized() {
		return this.value;
	}
	protected override _copyValue(param: ButtonParam) {}
	static override areRawInputEqual(
		raw_input1: ParamInitValuesTypeMap[ParamType.BUTTON],
		raw_input2: ParamInitValuesTypeMap[ParamType.BUTTON]
	) {
		return true;
	}
	static override areValuesEqual(
		val1: ParamValuesTypeMap[ParamType.BUTTON],
		val2: ParamValuesTypeMap[ParamType.BUTTON]
	) {
		return true;
	}
	async pressButton() {
		// cook the node in case it requires it, since the callback will not be ran if the node is cooking
		if (this.node.isDirty() || this.node.cookController.isCooking()) {
			await this.node.compute();
		}
		await this.options.executeCallback();
	}
}
