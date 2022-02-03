import {ParamType} from '../../../../poly/ParamType';
import {ParamInitValuesTypeMap} from '../../../../params/types/ParamInitValuesTypeMap';

import {TypedParam, BaseParamType} from '../../../../params/_Base';
import {NodeContext} from '../../../../poly/NodeContext';
import {BaseNodeType} from '../../../_Base';
import {ParamOptions} from '../../../../params/utils/OptionsController';

// import {ParamValueComparer} from '../../params/ParamValueComparer';
// import {ParamValueCloner} from '../../params/ParamValueCloner';
// import {CoreTextureLoader} from '../../../../../Core/Loader/Texture'

export class BaseParamConfig<T extends ParamType> {
	// private _texture_loader: CoreTextureLoader

	constructor(protected _type: T, protected _name: string, protected _defaultValue: ParamInitValuesTypeMap[T]) {
		if (_name == '' || _name == null) {
			throw new Error(`name must not be an empty string`);
		}
	}

	static fromParam<K extends ParamType>(param: TypedParam<K>): BaseParamConfig<K> {
		return new BaseParamConfig<K>(param.type(), param.name(), param.defaultValue());
	}

	type() {
		return this._type;
	}
	name() {
		return this._name;
	}
	defaultValue() {
		return this._defaultValue;
	}

	paramOptions(): ParamOptions {
		const callbackBound = this._callback.bind(this);
		switch (this._type) {
			case ParamType.NODE_PATH:
				return {callback: callbackBound, nodeSelection: {context: NodeContext.COP}};
			default:
				return {callback: callbackBound};
		}
	}
	applyToNode(node: BaseNodeType) {
		if (!node.params.has(this._name)) {
			return;
		}
		const param = node.params.get(this._name);
		if (!param) {
			return;
		}
		const additionalOptions = this.paramOptions();
		const additionalOptionNames = Object.keys(additionalOptions) as Array<keyof ParamOptions>;
		for (let optionName of additionalOptionNames) {
			param.options.setOption(optionName, additionalOptions[optionName]);
		}

		// We force the param configs to run their callbacks to ensure that the uniforms are up to date.
		// This seems better than running the parameter options callback, since it would check
		// if the scene is loading or the node cooking, which is unnecessary for uniforms
		this.executeCallback(node, param);

		// we also have a special case for operator path,
		// since they would not have found their node at load time
		if (param.type() == ParamType.NODE_PATH) {
			setTimeout(async () => {
				if (param.isDirty()) {
					await param.compute();
				}
				param.options.executeCallback();
			}, 200);
		}
	}
	executeCallback(node: BaseNodeType, param: BaseParamType) {
		this._callback(node, param);
	}

	protected _callback(node: BaseNodeType, param: BaseParamType) {}
}
