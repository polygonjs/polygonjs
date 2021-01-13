import {TypedParam} from './_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';

export class ButtonParam extends TypedParam<ParamType.BUTTON> {
	static type() {
		return ParamType.BUTTON;
	}
	get default_value_serialized() {
		return this.default_value;
	}
	get raw_input_serialized() {
		return this._raw_input;
	}
	get value_serialized() {
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
		if (this.node.isDirty() || this.node.cook_controller.is_cooking) {
			await this.node.requestContainer();
		}
		this.options.execute_callback();
	}
}
