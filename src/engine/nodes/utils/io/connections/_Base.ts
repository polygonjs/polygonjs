// import {
// 	ConnectionPointType,
// 	ConnectionPointInitValueMapGeneric,
// 	ConnectionPointInitValueMap,
// 	ConnectionPointTypeToParamTypeMap,
// 	IConnectionPointTypeToParamTypeMap,
// } from '../ConnectionPointType';
// import {ParamInitValuesTypeMap} from '../params/ParamsController';

export interface BaseConnectionPointData {
	name: string;
	type: string;
}

export class BaseConnectionPoint {
	protected _json: BaseConnectionPointData | undefined;
	// protected _init_value: any;

	constructor(
		protected _name: string,
		protected _type: string // protected _init_value?: ConnectionPointInitValueMapGeneric[T]
	) {
		// if (this._init_value === undefined) {
		// this._init_value = ConnectionPointInitValueMap[this._type];
		// }
	}
	get name() {
		return this._name;
	}
	get type() {
		return this._type;
	}
	// get param_type(): IConnectionPointTypeToParamTypeMap[T] {
	// 	return ConnectionPointTypeToParamTypeMap[this._type];
	// }
	// get init_value() {
	// 	return this._init_value;
	// }

	to_json(): BaseConnectionPointData {
		return (this._json = this._json || this._create_json());
	}
	protected _create_json(): BaseConnectionPointData {
		return {
			name: this._name,
			type: this._type,
		};
	}
}

// export type BaseNamedConnectionPointType = TypedNamedConnectionPoint<ConnectionPointType>;
