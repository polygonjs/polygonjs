import {ParamInitValuesTypeMap} from '../../../../params/types/ParamInitValuesTypeMap';
import {ParamType} from '../../../../poly/ParamType';

export enum JsConnectionPointType {
	BOOLEAN = 'boolean',
	COLOR = 'Color',
	FLOAT = 'float',
	INT = 'int',
	INTERSECTION = 'Intersection',
	MATERIAL = 'Material',
	MATRIX4 = 'Matrix4',
	OBJECT_3D = 'Object3D',
	PLANE = 'Plane',
	QUATERNION = 'Quaternion',
	RAY = 'Ray',
	STRING = 'string',
	TRIGGER = 'trigger',
	VECTOR2 = 'Vector2',
	VECTOR3 = 'Vector3',
	VECTOR4 = 'Vector4',
	// MAT3 = 'mat3',
	// MAT4 = 'mat4',
}

const NUMBER_JS_CONNECTION_TYPES = new Set([JsConnectionPointType.FLOAT, JsConnectionPointType.INT]);
const PRIMITIVE_JS_CONNECTION_TYPES = new Set([
	JsConnectionPointType.BOOLEAN,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.INT,
	JsConnectionPointType.STRING,
]);
const VECTOR_JS_CONNECTION_TYPES = new Set([
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
]);
export const JS_CONNECTION_TYPES_FOR_CONSTANT = [
	JsConnectionPointType.BOOLEAN,
	JsConnectionPointType.COLOR,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.INT,
	JsConnectionPointType.STRING,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];
export function isJsConnectionPointNumber(type: JsConnectionPointType) {
	return NUMBER_JS_CONNECTION_TYPES.has(type);
}
export function isJsConnectionPointPrimitive(type: JsConnectionPointType) {
	return PRIMITIVE_JS_CONNECTION_TYPES.has(type);
}
export function isJsConnectionPointVector(type: JsConnectionPointType) {
	return VECTOR_JS_CONNECTION_TYPES.has(type);
}

//
//
// ALL GL Data types in an array
//
//
export const JS_CONNECTION_POINT_TYPES: Array<JsConnectionPointType> = [
	JsConnectionPointType.BOOLEAN,
	JsConnectionPointType.COLOR,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.INT,
	JsConnectionPointType.INTERSECTION,
	JsConnectionPointType.MATERIAL,
	JsConnectionPointType.MATRIX4,
	JsConnectionPointType.OBJECT_3D,
	JsConnectionPointType.PLANE,
	JsConnectionPointType.QUATERNION,
	JsConnectionPointType.RAY,
	JsConnectionPointType.STRING,
	JsConnectionPointType.TRIGGER,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
	// JsConnectionPointType.MAT3,
	// JsConnectionPointType.MAT4,
];

//
//
// Map to convert from a Js Data type to a ParamType
//
//
type JSConnectionPointTypeToParamTypeMapGeneric = {[key in JsConnectionPointType]: ParamType | undefined};
export interface JsIConnectionPointTypeToParamTypeMap extends JSConnectionPointTypeToParamTypeMapGeneric {
	[JsConnectionPointType.BOOLEAN]: ParamType.BOOLEAN;
	[JsConnectionPointType.COLOR]: ParamType.COLOR;
	[JsConnectionPointType.FLOAT]: ParamType.FLOAT;
	[JsConnectionPointType.INT]: ParamType.INTEGER;
	[JsConnectionPointType.INTERSECTION]: ParamType.BUTTON;
	[JsConnectionPointType.MATERIAL]: ParamType.BUTTON;
	[JsConnectionPointType.MATRIX4]: ParamType.BUTTON;
	[JsConnectionPointType.OBJECT_3D]: ParamType.BUTTON;
	[JsConnectionPointType.PLANE]: ParamType.BUTTON;
	[JsConnectionPointType.QUATERNION]: ParamType.BUTTON;
	[JsConnectionPointType.RAY]: ParamType.BUTTON;
	[JsConnectionPointType.STRING]: ParamType.STRING;
	[JsConnectionPointType.TRIGGER]: ParamType.BUTTON;
	[JsConnectionPointType.VECTOR2]: ParamType.VECTOR2;
	[JsConnectionPointType.VECTOR3]: ParamType.VECTOR3;
	[JsConnectionPointType.VECTOR4]: ParamType.VECTOR4;
	// [JsConnectionPointType.MAT3]: undefined;
	// [JsConnectionPointType.MAT4]: undefined;
}
export const JsConnectionPointTypeToParamTypeMap: JsIConnectionPointTypeToParamTypeMap = {
	[JsConnectionPointType.BOOLEAN]: ParamType.BOOLEAN,
	[JsConnectionPointType.COLOR]: ParamType.COLOR,
	[JsConnectionPointType.FLOAT]: ParamType.FLOAT,
	[JsConnectionPointType.INT]: ParamType.INTEGER,
	[JsConnectionPointType.INTERSECTION]: ParamType.BUTTON,
	[JsConnectionPointType.MATERIAL]: ParamType.BUTTON,
	[JsConnectionPointType.MATRIX4]: ParamType.BUTTON,
	[JsConnectionPointType.OBJECT_3D]: ParamType.BUTTON,
	[JsConnectionPointType.PLANE]: ParamType.BUTTON,
	[JsConnectionPointType.QUATERNION]: ParamType.BUTTON,
	[JsConnectionPointType.RAY]: ParamType.BUTTON,
	[JsConnectionPointType.STRING]: ParamType.STRING,
	[JsConnectionPointType.TRIGGER]: ParamType.BUTTON,
	[JsConnectionPointType.VECTOR2]: ParamType.VECTOR2,
	[JsConnectionPointType.VECTOR3]: ParamType.VECTOR3,
	[JsConnectionPointType.VECTOR4]: ParamType.VECTOR4,
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
	[ParamType.BOOLEAN]: JsConnectionPointType.BOOLEAN;
	[ParamType.COLOR]: JsConnectionPointType.COLOR;
	[ParamType.FLOAT]: JsConnectionPointType.FLOAT;
	[ParamType.INTEGER]: JsConnectionPointType.INT;
	[ParamType.FOLDER]: undefined;
	[ParamType.VECTOR2]: JsConnectionPointType.VECTOR2;
	[ParamType.VECTOR3]: JsConnectionPointType.VECTOR3;
	[ParamType.VECTOR4]: JsConnectionPointType.VECTOR4;
	[ParamType.BUTTON]: undefined;
	// [ParamType.OPERATOR_PATH]: undefined;
	[ParamType.PARAM_PATH]: undefined;
	[ParamType.NODE_PATH]: undefined;
	[ParamType.RAMP]: undefined;
	[ParamType.STRING]: JsConnectionPointType.STRING;
}
export const JsParamTypeToConnectionPointTypeMap: IJsParamTypeToConnectionPointTypeMap = {
	[ParamType.BOOLEAN]: JsConnectionPointType.BOOLEAN,
	[ParamType.COLOR]: JsConnectionPointType.COLOR,
	[ParamType.FLOAT]: JsConnectionPointType.FLOAT,
	[ParamType.INTEGER]: JsConnectionPointType.INT,
	[ParamType.FOLDER]: undefined,
	[ParamType.VECTOR2]: JsConnectionPointType.VECTOR2,
	[ParamType.VECTOR3]: JsConnectionPointType.VECTOR3,
	[ParamType.VECTOR4]: JsConnectionPointType.VECTOR4,
	[ParamType.BUTTON]: undefined,
	// [ParamType.OPERATOR_PATH]: undefined,
	[ParamType.PARAM_PATH]: undefined,
	[ParamType.NODE_PATH]: undefined,
	[ParamType.RAMP]: undefined,
	[ParamType.STRING]: JsConnectionPointType.STRING,
};

//
//
// Map of Js Data type default values
//
//
export type ConnectionPointInitValueMapGeneric = {
	[key in JsConnectionPointType]: ParamInitValuesTypeMap[JsIConnectionPointTypeToParamTypeMap[key]];
};
export const JsConnectionPointInitValueMap: ConnectionPointInitValueMapGeneric = {
	[JsConnectionPointType.BOOLEAN]: false,
	[JsConnectionPointType.COLOR]: [1, 1, 1],
	[JsConnectionPointType.FLOAT]: 0,
	[JsConnectionPointType.INT]: 0,
	[JsConnectionPointType.INTERSECTION]: null,
	[JsConnectionPointType.MATERIAL]: null,
	[JsConnectionPointType.MATRIX4]: null,
	[JsConnectionPointType.OBJECT_3D]: null,
	[JsConnectionPointType.PLANE]: null,
	[JsConnectionPointType.QUATERNION]: null,
	[JsConnectionPointType.RAY]: null,
	[JsConnectionPointType.STRING]: '',
	[JsConnectionPointType.TRIGGER]: null,
	[JsConnectionPointType.VECTOR2]: [0, 0],
	[JsConnectionPointType.VECTOR3]: [0, 0, 0],
	[JsConnectionPointType.VECTOR4]: [0, 0, 0, 0],
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
	[JsConnectionPointType.BOOLEAN]: 1,
	[JsConnectionPointType.COLOR]: 3,
	[JsConnectionPointType.FLOAT]: 1,
	[JsConnectionPointType.INT]: 1,
	[JsConnectionPointType.INTERSECTION]: 1,
	[JsConnectionPointType.MATERIAL]: 1,
	[JsConnectionPointType.MATRIX4]: 1,
	[JsConnectionPointType.OBJECT_3D]: 1,
	[JsConnectionPointType.PLANE]: 1,
	[JsConnectionPointType.QUATERNION]: 1,
	[JsConnectionPointType.RAY]: 1,
	[JsConnectionPointType.STRING]: 1,
	[JsConnectionPointType.TRIGGER]: 1,
	[JsConnectionPointType.VECTOR2]: 2,
	[JsConnectionPointType.VECTOR3]: 3,
	[JsConnectionPointType.VECTOR4]: 4,
};

export interface JsConnectionPointData<T extends JsConnectionPointType> {
	name: string;
	type: T;
	isArray?: boolean;
}

import {BaseConnectionPoint} from './_Base';
interface JsConnectionPointOptions<T extends JsConnectionPointType> {
	inNodeDefinition?: boolean;
	init_value?: ConnectionPointInitValueMapGeneric[T];
}
export const JS_CONNECTION_POINT_IN_NODE_DEF: JsConnectionPointOptions<JsConnectionPointType> = {
	inNodeDefinition: true,
};

export class JsConnectionPoint<T extends JsConnectionPointType> extends BaseConnectionPoint {
	protected override _json: JsConnectionPointData<T> | undefined;
	protected override _init_value?: ConnectionPointInitValueMapGeneric[T];

	constructor(_name: string, protected override _type: T, protected _options?: JsConnectionPointOptions<T>) {
		super(_name, _type);
		// if (this._init_value === undefined) {
		this._init_value = JsConnectionPointInitValueMap[this._type];
		// }

		if (_options) {
			this._inNodeDefinition = _options.inNodeDefinition == true;
			if (_options.init_value != null) {
				this._init_value = _options.init_value;
			}
		}
	}
	override type() {
		return this._type;
	}
	override are_types_matched(src_type: string, dest_type: string): boolean {
		return src_type == dest_type;
	}
	get param_type(): JsIConnectionPointTypeToParamTypeMap[T] {
		return JsConnectionPointTypeToParamTypeMap[this._type];
	}
	override get init_value() {
		return this._init_value;
	}

	override toJSON(): JsConnectionPointData<T> {
		return (this._json = this._json || this._create_json());
	}
	protected override _create_json(): JsConnectionPointData<T> {
		return {
			name: this._name,
			type: this._type,
			// isArray: false,
		};
	}
}

export type BaseJsConnectionPoint = JsConnectionPoint<JsConnectionPointType>;
