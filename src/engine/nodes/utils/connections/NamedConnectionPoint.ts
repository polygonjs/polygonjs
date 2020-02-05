import {
	ConnectionPointType,
	ConnectionPointInitValueMapGeneric,
	ConnectionPointInitValueMap,
	ConnectionPointTypeToParamTypeMap,
	IConnectionPointTypeToParamTypeMap,
} from './ConnectionPointType';
// import {ParamInitValuesTypeMap} from '../params/ParamsController';

interface TypedNamedConnectionPointData {
	name: string;
}

export class TypedNamedConnectionPoint<T extends ConnectionPointType> {
	private _json: TypedNamedConnectionPointData | undefined;

	constructor(
		protected _name: string,
		protected _type: T,
		protected _init_value?: ConnectionPointInitValueMapGeneric[T]
	) {
		if (this._init_value === undefined) {
			this._init_value = ConnectionPointInitValueMap[this._type];
		}
	}
	get name() {
		return this._name;
	}
	get type() {
		return this._type;
	}
	get param_type(): IConnectionPointTypeToParamTypeMap[T] {
		return ConnectionPointTypeToParamTypeMap[this._type];
	}
	get init_value() {
		return this._init_value;
	}

	to_json(): TypedNamedConnectionPointData {
		return (this._json = this._json || this._create_json);
	}
	private _create_json(): TypedNamedConnectionPointData {
		return {
			name: this._name,
		};
	}
}

export type BaseNamedConnectionPointType = TypedNamedConnectionPoint<ConnectionPointType>;
