import {ParamType} from '../../../../poly/ParamType';
import {ParamInitValuesTypeMap} from '../../../../params/types/ParamInitValuesTypeMap';

import {TypedParam, BaseParamType} from '../../../../params/_Base';
import {NodeContext} from '../../../../poly/NodeContext';
import {BaseNodeType} from '../../../_Base';
import {ParamOptions} from '../../../../params/utils/OptionsController';

// import {ParamValueComparer} from '../../params/ParamValueComparer';
// import {ParamValueCloner} from '../../params/ParamValueCloner';
// import {CoreTextureLoader} from '../../../../../Core/Loader/Texture'

export class ParamConfig<T extends ParamType> {
	// private _texture_loader: CoreTextureLoader

	constructor(protected _type: T, protected _name: string, protected _default_value: ParamInitValuesTypeMap[T]) {}

	static from_param<K extends ParamType>(param: TypedParam<K>): ParamConfig<K> {
		return new ParamConfig<K>(param.type(), param.name(), param.default_value);
	}

	type() {
		return this._type;
	}
	name() {
		return this._name;
	}
	get default_value() {
		return this._default_value;
	}

	get param_options(): ParamOptions {
		const callback_bound = this._callback.bind(this);
		switch (this._type) {
			case ParamType.OPERATOR_PATH:
				return {callback: callback_bound, nodeSelection: {context: NodeContext.COP}};
			default:
				return {callback: callback_bound};
		}
	}
	protected _callback(node: BaseNodeType, param: BaseParamType) {}
}
