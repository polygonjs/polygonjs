import {ParamsInitData} from '../../../engine/nodes/utils/io/IOController';
import {ParamType} from '../../../engine/poly/ParamType';
import {Color} from 'three/src/math/Color';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {BaseNodeType} from '../../../engine/nodes/_Base';
import {BaseOperation} from '../_Base';
import {OperationInputsController} from './utils/InputsController';
import {CoreType} from '../../../core/Type';
import {NodeContext} from '../../poly/NodeContext';
import {DefaultOperationParam, DefaultOperationParams} from '../../../core/operations/_Base';

export class BaseOperationContainer<NC extends NodeContext> {
	protected params: DefaultOperationParams = {};
	private _path_params: TypedNodePathParamValue[] | undefined;

	constructor(protected operation: BaseOperation<NC>, protected name: string, init_params: ParamsInitData) {
		this._applyDefaultParams();
		this._applyInitParams(init_params);
		this._initClonedStates();
	}

	//
	//
	// PATH PARAMS
	//
	//
	pathParamResolveRequired() {
		return this._path_params != null;
	}
	resolvePathParams(node_start: BaseNodeType) {
		if (!this._path_params) {
			return;
		}
		for (let path_param of this._path_params) {
			path_param.resolve(node_start);
		}
	}

	//
	//
	// PARAM VALUES CONVERSION
	//
	//
	private _applyDefaultParams() {
		const default_params = (this.operation.constructor as typeof BaseOperation).DEFAULT_PARAMS;
		const param_names = Object.keys(default_params);
		for (let param_name of param_names) {
			const param_data = default_params[param_name];
			const clone_param_data = this._convertParamData(param_name, param_data);
			if (clone_param_data != undefined) {
				this.params[param_name] = clone_param_data;
			}
		}
	}

	private _applyInitParams(init_params: ParamsInitData) {
		const paramNames = Object.keys(init_params);
		for (let paramName of paramNames) {
			const param_data = init_params[paramName];
			if (param_data.simple_data != null) {
				const simple_data = param_data.simple_data;
				const clone_param_data = this.operation.convertExportParamData({
					paramName,
					paramData: simple_data,
					params: this.params,
				});
				if (clone_param_data != undefined) {
					this.params[paramName] = clone_param_data;
				}
			}
		}
	}

	private _convertParamData(param_name: string, param_data: DefaultOperationParam<ParamType>) {
		if (CoreType.isNumber(param_data) || CoreType.isBoolean(param_data) || CoreType.isString(param_data)) {
			return param_data;
		}
		if (param_data instanceof TypedNodePathParamValue) {
			const cloned = param_data.clone();
			if (!this._path_params) {
				this._path_params = [];
			}
			this._path_params.push(cloned);
			return cloned;
		}
		if (
			param_data instanceof Color ||
			param_data instanceof Vector2 ||
			param_data instanceof Vector3 ||
			param_data instanceof Vector4
		) {
			return param_data.clone();
		}
	}

	//
	//
	// INPUTS
	//
	//
	protected _inputs: BaseOperationContainer<NC>[] | undefined;
	setInput(index: number, input: BaseOperationContainer<NC>) {
		this._inputs = this._inputs || [];
		this._inputs[index] = input;
	}
	inputsCount() {
		if (this._inputs) {
			return this._inputs.length;
		} else {
			return 0;
		}
	}

	private _inputsController: OperationInputsController<NC> | undefined;
	protected inputsController() {
		return (this._inputsController = this._inputsController || new OperationInputsController<NC>(this));
	}
	private _initClonedStates() {
		const default_cloned_states = (this.operation.constructor as typeof BaseOperation).INPUT_CLONED_STATE;
		this.inputsController().initInputsClonedState(default_cloned_states);
	}
	inputCloneRequired(index: number): boolean {
		if (!this._inputsController) {
			return true;
		}
		return this._inputsController.cloneRequired(index);
	}
	overrideInputCloneState(state: boolean) {
		this.inputsController().override_cloned_state(state);
	}

	//
	//
	// COOK
	//
	//
	cook(input_contents: any[]) {
		return this.operation.cook(input_contents, this.params);
	}
}
