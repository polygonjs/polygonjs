// import {
// 	ConnectionPointType,
// 	ConnectionPointInitValueMapGeneric,
// 	ConnectionPointInitValueMap,
// 	ConnectionPointTypeToParamTypeMap,
// 	IConnectionPointTypeToParamTypeMap,
// } from '../ConnectionPointType';
// import {ParamInitValuesTypeMap} from '../params/ParamsController';

import {ParamType} from '../../../../poly/ParamType';

export interface BaseConnectionPointData {
	name: string;
	type: string;
	isArray?: boolean;
}

export abstract class BaseConnectionPoint {
	protected _json: BaseConnectionPointData | undefined;
	// protected _init_value: any;

	protected _inNodeDefinition: boolean = false;

	constructor(protected _name: string, protected _type: string, protected _init_value?: any) {
		// if (this._init_value === undefined) {
		// this._init_value = ConnectionPointInitValueMap[this._type];
		// }
	}
	get init_value() {
		return this._init_value;
	}
	name() {
		return this._name;
	}
	type() {
		return this._type;
	}

	are_types_matched(src_type: string, dest_type: string): boolean {
		return true;
	}
	inNodeDefinition() {
		return this._inNodeDefinition;
	}
	abstract get param_type(): ParamType | null;
	// get param_type(): IConnectionPointTypeToParamTypeMap[T] {
	// 	return ConnectionPointTypeToParamTypeMap[this._type];
	// }
	// get init_value() {
	// 	return this._init_value;
	// }

	toJSON(): BaseConnectionPointData {
		return (this._json = this._json || this._create_json());
	}
	protected _create_json(): BaseConnectionPointData {
		return {
			name: this._name,
			type: this._type,
			// isArray: false,
		};
	}
}

// export type BaseNamedConnectionPointType = TypedNamedConnectionPoint<ConnectionPointType>;
