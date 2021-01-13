import {ParamInitValuesTypeMap} from '../../../../params/types/ParamInitValuesTypeMap';
import {ParamType} from '../../../../poly/ParamType';

export enum JsConnectionPointType {
	BOOL = 'bool',
	INT = 'int',
	FLOAT = 'float',
	VEC2 = 'vec2',
	VEC3 = 'vec3',
	VEC4 = 'vec4',
	// MAT3 = 'mat3',
	// MAT4 = 'mat4',
}

//
//
// ALL GL Data types in an array
//
//
export const JS_CONNECTION_POINT_TYPES: Array<JsConnectionPointType> = [
	JsConnectionPointType.BOOL,
	JsConnectionPointType.INT,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.VEC2,
	JsConnectionPointType.VEC3,
	JsConnectionPointType.VEC4,
	// JsConnectionPointType.MAT3,
	// JsConnectionPointType.MAT4,
];

//
//
// Map to convert from a Js Data type to a ParamType
//
//
type ConnectionPointTypeToParamTypeMapGeneric = {[key in JsConnectionPointType]: ParamType | undefined};
export interface IConnectionPointTypeToParamTypeMap extends ConnectionPointTypeToParamTypeMapGeneric {
	[JsConnectionPointType.BOOL]: ParamType.BOOLEAN;
	[JsConnectionPointType.INT]: ParamType.INTEGER;
	[JsConnectionPointType.FLOAT]: ParamType.FLOAT;
	[JsConnectionPointType.VEC2]: ParamType.VECTOR2;
	[JsConnectionPointType.VEC3]: ParamType.VECTOR3;
	[JsConnectionPointType.VEC4]: ParamType.VECTOR4;
	// [JsConnectionPointType.MAT3]: undefined;
	// [JsConnectionPointType.MAT4]: undefined;
}
export const JsConnectionPointTypeToParamTypeMap: IConnectionPointTypeToParamTypeMap = {
	[JsConnectionPointType.BOOL]: ParamType.BOOLEAN,
	[JsConnectionPointType.INT]: ParamType.INTEGER,
	[JsConnectionPointType.FLOAT]: ParamType.FLOAT,
	[JsConnectionPointType.VEC2]: ParamType.VECTOR2,
	[JsConnectionPointType.VEC3]: ParamType.VECTOR3,
	[JsConnectionPointType.VEC4]: ParamType.VECTOR4,
	// [JsConnectionPointType.MAT3]: undefined,
	// [JsConnectionPointType.MAT4]: undefined,
};

//
//
// Map to convert from a ParamType to GL Data type
//
//
type JsParamTypeToConnectionPointTypeMapGeneric = {[key in ParamType]: JsConnectionPointType | undefined};
export interface IJsParamTypeToConnectionPointTypeMap extends JsParamTypeToConnectionPointTypeMapGeneric {
	[ParamType.BOOLEAN]: JsConnectionPointType.BOOL;
	[ParamType.COLOR]: JsConnectionPointType.VEC3;
	[ParamType.INTEGER]: JsConnectionPointType.INT;
	[ParamType.FLOAT]: JsConnectionPointType.FLOAT;
	[ParamType.FOLDER]: undefined;
	[ParamType.VECTOR2]: JsConnectionPointType.VEC2;
	[ParamType.VECTOR3]: JsConnectionPointType.VEC3;
	[ParamType.VECTOR4]: JsConnectionPointType.VEC4;
	[ParamType.BUTTON]: undefined;
	[ParamType.OPERATOR_PATH]: undefined;
	[ParamType.PARAM_PATH]: undefined;
	[ParamType.NODE_PATH]: undefined;
	[ParamType.RAMP]: undefined;
	[ParamType.SEPARATOR]: undefined;
	[ParamType.STRING]: undefined;
}
export const JsParamTypeToConnectionPointTypeMap: IJsParamTypeToConnectionPointTypeMap = {
	[ParamType.BOOLEAN]: JsConnectionPointType.BOOL,
	[ParamType.COLOR]: JsConnectionPointType.VEC3,
	[ParamType.INTEGER]: JsConnectionPointType.INT,
	[ParamType.FLOAT]: JsConnectionPointType.FLOAT,
	[ParamType.FOLDER]: undefined,
	[ParamType.VECTOR2]: JsConnectionPointType.VEC2,
	[ParamType.VECTOR3]: JsConnectionPointType.VEC3,
	[ParamType.VECTOR4]: JsConnectionPointType.VEC4,
	[ParamType.BUTTON]: undefined,
	[ParamType.OPERATOR_PATH]: undefined,
	[ParamType.PARAM_PATH]: undefined,
	[ParamType.NODE_PATH]: undefined,
	[ParamType.RAMP]: undefined,
	[ParamType.SEPARATOR]: undefined,
	[ParamType.STRING]: undefined,
};

//
//
// Map of Js Data type default values
//
//
export type ConnectionPointInitValueMapGeneric = {
	[key in JsConnectionPointType]: ParamInitValuesTypeMap[IConnectionPointTypeToParamTypeMap[key]];
};
export const JsConnectionPointInitValueMap: ConnectionPointInitValueMapGeneric = {
	[JsConnectionPointType.BOOL]: false,
	[JsConnectionPointType.INT]: 0,
	[JsConnectionPointType.FLOAT]: 0,
	[JsConnectionPointType.VEC2]: [0, 0],
	[JsConnectionPointType.VEC3]: [0, 0, 0],
	[JsConnectionPointType.VEC4]: [0, 0, 0, 0],
	// [JsConnectionPointType.MAT3]: [0],
	// [JsConnectionPointType.MAT4]: [0],
};

//
//
// Map of Js Data type component counts
//
//
export type ConnectionPointComponentsCountMapGeneric = {
	[key in JsConnectionPointType]: number;
};
export const GlConnectionPointComponentsCountMap: ConnectionPointComponentsCountMapGeneric = {
	[JsConnectionPointType.BOOL]: 1,
	[JsConnectionPointType.INT]: 1,
	[JsConnectionPointType.FLOAT]: 1,
	[JsConnectionPointType.VEC2]: 2,
	[JsConnectionPointType.VEC3]: 3,
	[JsConnectionPointType.VEC4]: 4,
};

export interface JsConnectionPointData<T extends JsConnectionPointType> {
	name: string;
	type: T;
}

import {BaseConnectionPoint} from './_Base';
export class JsConnectionPoint<T extends JsConnectionPointType> extends BaseConnectionPoint {
	protected _json: JsConnectionPointData<T> | undefined;
	protected _init_value: any;

	constructor(
		protected _name: string,
		protected _type: T // protected _init_value?: ConnectionPointInitValueMapGeneric[T]
	) {
		super(_name, _type);
		// if (this._init_value === undefined) {
		this._init_value = JsConnectionPointInitValueMap[this._type];
		// }
	}
	type() {
		return this._type;
	}
	are_types_matched(src_type: string, dest_type: string): boolean {
		return src_type == dest_type;
	}
	get param_type(): IConnectionPointTypeToParamTypeMap[T] {
		return JsConnectionPointTypeToParamTypeMap[this._type];
	}
	get init_value() {
		return this._init_value;
	}

	toJSON(): JsConnectionPointData<T> {
		return (this._json = this._json || this._create_json());
	}
	protected _create_json(): JsConnectionPointData<T> {
		return {
			name: this._name,
			type: this._type,
		};
	}
}

export type BaseJsConnectionPoint = JsConnectionPoint<JsConnectionPointType>;
