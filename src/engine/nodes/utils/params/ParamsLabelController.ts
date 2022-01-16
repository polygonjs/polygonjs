import {BaseParamType} from '../../../params/_Base';
import {ParamType} from '../../../poly/ParamType';
import {StringParam} from '../../../params/String';
// import {OperatorPathParam} from '../../../params/OperatorPath';
import {FloatParam} from '../../../params/Float';
import {IntegerParam} from '../../../params/Integer';
import {NodePathParam} from '../../../params/NodePath';
import {ParamPathParam} from '../../../params/ParamPath';

type LabelControllerCallback = () => string | string[];

export class ParamsLabelController {
	private _callback: LabelControllerCallback | undefined;
	private _params: BaseParamType[] | undefined;

	dispose() {
		this._callback = undefined;
	}

	params() {
		return this._params;
	}
	callback() {
		return this._callback;
	}

	init(params: BaseParamType[], callback?: LabelControllerCallback) {
		this._params = params;
		if (callback) {
			this._callback = callback;
		} else {
			const param = this._params[0];
			switch (param.type()) {
				case ParamType.STRING:
					return this._handle_string_param(param as StringParam);
				// case ParamType.OPERATOR_PATH:
				// 	return this._handle_operator_path_param(param as OperatorPathParam);
				case ParamType.NODE_PATH:
					return this._handle_node_path_param(param as NodePathParam);
				case ParamType.PARAM_PATH:
					return this._handle_param_path_param(param as ParamPathParam);
				case ParamType.FLOAT:
					return this._handle_number_param(param as FloatParam);
				case ParamType.INTEGER:
					return this._handle_number_param(param as IntegerParam);
			}
		}
	}

	private _handle_string_param(param: StringParam) {
		this._callback = () => {
			return param.value;
		};
	}
	// private _handle_operator_path_param(param: OperatorPathParam) {
	// 	this._callback = () => {
	// 		return param.value;
	// 	};
	// }
	private _handle_node_path_param(param: NodePathParam) {
		this._callback = () => {
			return param.value.path();
		};
	}
	private _handle_param_path_param(param: ParamPathParam) {
		this._callback = () => {
			return param.value.path();
		};
	}
	private _handle_number_param(param: FloatParam | IntegerParam) {
		this._callback = () => {
			return `${param.value}`;
		};
	}
}
