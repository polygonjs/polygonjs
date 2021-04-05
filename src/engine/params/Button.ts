import {TypedParam} from './_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';

export class ButtonParam extends TypedParam<ParamType.BUTTON> {
	static type() {
		return ParamType.BUTTON;
	}
	defaultValueSerialized() {
		return this._default_value;
	}
	rawInputSerialized() {
		return this._raw_input;
	}
	valueSerialized() {
		return this.value;
	}
	protected _copy_value(param: ButtonParam) {}
	static are_raw_input_equal(
		raw_input1: ParamInitValuesTypeMap[ParamType.BUTTON],
		raw_input2: ParamInitValuesTypeMap[ParamType.BUTTON]
	) {
		return true;
	}
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.BUTTON], val2: ParamValuesTypeMap[ParamType.BUTTON]) {
		return true;
	}
	async pressButton() {
		// cook the node in case it requires it, since the callback will not be ran if the node is cooking
		if (this.node.isDirty() || this.node.cookController.isCooking()) {
			await this.node.compute();
		}
		this.options.executeCallback();
	}
}
