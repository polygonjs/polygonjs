import {ParamInitValuesTypeMap} from '../../../params/types/ParamInitValuesTypeMap';

import {ParamType} from 'src/engine/poly/ParamType';
import {RampParam} from 'src/engine/params/Ramp';

// TODO: simplify GLDataType into one enum
// http://learnwebgl.brown37.net/12_shader_language/glsl_data_types.html

//
//
// GL Data types
//
//
export enum ConnectionPointType {
	BOOL = 'bool',
	// BVEC2 = 'bvec2',
	// BVEC3 = 'bvec3',
	// BVEC4 = 'bvec4',
	INT = 'int',
	// IVEC2 = 'ivec2',
	// IVEC3 = 'ivec3',
	// IVEC4 = 'ivec4',
	FLOAT = 'float',
	VEC2 = 'vec2',
	VEC3 = 'vec3',
	VEC4 = 'vec4',
	// matrices to be used later
	// MAT2 = 'mat2',
	// MAT3 = 'mat3',
	// MAT4 = 'mat4',
	SAMPLER_2D = 'sampler2D',
}

//
//
// ALL GL Data types in an array
//
//
export const ConnectionPointTypes: Array<ConnectionPointType> = [
	ConnectionPointType.BOOL,
	// ConnectionPointType.BVEC2,
	// ConnectionPointType.BVEC3,
	// ConnectionPointType.BVEC4,
	ConnectionPointType.INT,
	// ConnectionPointType.IVEC2,
	// ConnectionPointType.IVEC3,
	// ConnectionPointType.IVEC4,
	ConnectionPointType.FLOAT,
	ConnectionPointType.VEC2,
	ConnectionPointType.VEC3,
	ConnectionPointType.VEC4,
];

//
//
// Map to convert from a GL Data type to a ParamType
//
//
type ConnectionPointTypeToParamTypeMapGeneric = {[key in ConnectionPointType]: ParamType};
export interface IConnectionPointTypeToParamTypeMap extends ConnectionPointTypeToParamTypeMapGeneric {
	[ConnectionPointType.BOOL]: ParamType.BOOLEAN;
	// [ConnectionPointType.BVEC2]: [ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC3]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC4]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	[ConnectionPointType.INT]: ParamType.INTEGER;
	// [ConnectionPointType.IVEC2]: [ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC3]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC4]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	[ConnectionPointType.FLOAT]: ParamType.FLOAT;
	[ConnectionPointType.VEC2]: ParamType.VECTOR2;
	[ConnectionPointType.VEC3]: ParamType.VECTOR3;
	[ConnectionPointType.VEC4]: ParamType.VECTOR4;
}
export const ConnectionPointTypeToParamTypeMap: IConnectionPointTypeToParamTypeMap = {
	[ConnectionPointType.BOOL]: ParamType.BOOLEAN,
	// [ConnectionPointType.BVEC2]: [ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC3]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC4]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	[ConnectionPointType.INT]: ParamType.INTEGER,
	// [ConnectionPointType.IVEC2]: [ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC3]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC4]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	[ConnectionPointType.FLOAT]: ParamType.FLOAT,
	[ConnectionPointType.VEC2]: ParamType.VECTOR2,
	[ConnectionPointType.VEC3]: ParamType.VECTOR3,
	[ConnectionPointType.VEC4]: ParamType.VECTOR4,

	[ConnectionPointType.SAMPLER_2D]: ParamType.RAMP,
};

//
//
// Map to convert from a ParamType to GL Data type
//
//
type ParamTypeToConnectionPointTypeMapGeneric = {[key in ParamType]: ConnectionPointType | undefined};
export interface IParamTypeToConnectionPointTypeMap extends ParamTypeToConnectionPointTypeMapGeneric {
	[ParamType.BOOLEAN]: ConnectionPointType.BOOL;
	[ParamType.COLOR]: ConnectionPointType.VEC3;
	// [ConnectionPointType.BVEC2]: [ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC3]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC4]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	[ParamType.INTEGER]: ConnectionPointType.INT;
	// [ConnectionPointType.IVEC2]: [ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC3]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC4]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	[ParamType.FLOAT]: ConnectionPointType.FLOAT;
	[ParamType.VECTOR2]: ConnectionPointType.VEC2;
	[ParamType.VECTOR3]: ConnectionPointType.VEC3;
	[ParamType.VECTOR4]: ConnectionPointType.VEC4;
	[ParamType.BUTTON]: undefined;
	[ParamType.OPERATOR_PATH]: undefined;
	[ParamType.RAMP]: undefined;
	[ParamType.SEPARATOR]: undefined;
	[ParamType.STRING]: undefined;
}
export const ParamTypeToConnectionPointTypeMap: IParamTypeToConnectionPointTypeMap = {
	[ParamType.BOOLEAN]: ConnectionPointType.BOOL,
	[ParamType.COLOR]: ConnectionPointType.VEC3,
	// [ConnectionPointType.BVEC2]: [ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC3]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC4]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	[ParamType.INTEGER]: ConnectionPointType.INT,
	// [ConnectionPointType.IVEC2]: [ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC3]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC4]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	[ParamType.FLOAT]: ConnectionPointType.FLOAT,
	[ParamType.VECTOR2]: ConnectionPointType.VEC2,
	[ParamType.VECTOR3]: ConnectionPointType.VEC3,
	[ParamType.VECTOR4]: ConnectionPointType.VEC4,
	[ParamType.BUTTON]: undefined,
	[ParamType.OPERATOR_PATH]: undefined,
	[ParamType.RAMP]: undefined,
	[ParamType.SEPARATOR]: undefined,
	[ParamType.STRING]: undefined,
};

//
//
// Map of GL Data type default values
//
//
export type ConnectionPointInitValueMapGeneric = {
	[key in ConnectionPointType]: ParamInitValuesTypeMap[IConnectionPointTypeToParamTypeMap[key]];
};
export const ConnectionPointInitValueMap: ConnectionPointInitValueMapGeneric = {
	[ConnectionPointType.BOOL]: false,
	// [ConnectionPointType.BVEC2]: [ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC3]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC4]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	[ConnectionPointType.INT]: 0,
	// [ConnectionPointType.IVEC2]: [ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC3]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC4]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	[ConnectionPointType.FLOAT]: 0,
	[ConnectionPointType.VEC2]: [0, 0],
	[ConnectionPointType.VEC3]: [0, 0, 0],
	[ConnectionPointType.VEC4]: [0, 0, 0, 0],

	[ConnectionPointType.SAMPLER_2D]: RampParam.DEFAULT_VALUE_JSON,
};

//
//
// Map of GL Data type component counts
//
//
export type ConnectionPointComponentsCountMapGeneric = {
	[key in ConnectionPointType]: number;
};
export const ConnectionPointComponentsCountMap: ConnectionPointComponentsCountMapGeneric = {
	[ConnectionPointType.BOOL]: 1,
	// [ConnectionPointType.BVEC2]: [ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC3]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC4]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	[ConnectionPointType.INT]: 1,
	// [ConnectionPointType.IVEC2]: [ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC3]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC4]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	[ConnectionPointType.FLOAT]: 1,
	[ConnectionPointType.VEC2]: 2,
	[ConnectionPointType.VEC3]: 3,
	[ConnectionPointType.VEC4]: 4,
	[ConnectionPointType.SAMPLER_2D]: 1,
};
