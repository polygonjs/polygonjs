import {ParamInitValuesTypeMap} from '../../../../params/types/ParamInitValuesTypeMap';

import {ParamType} from '../../../../poly/ParamType';
import {RampParam} from '../../../../params/Ramp';
// import {BaseTypedConnection} from './_Base';

// TODO: simplify GLDataType into one enum
// http://learnwebgl.brown37.net/12_shader_language/glsl_data_types.html

//
//
// GL Data types
//
//

export enum GlConnectionPointType {
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
	SAMPLER_3D = 'sampler3D',
	SAMPLER_CUBE = 'samplerCube',
	SSS_MODEL = 'SSSModel',
	SDF_CONTEXT = 'SDFContext',
	SDF_MATERIAL = 'SDFMaterial',
}
// interface IGlConnectionPointType {
// 	[EnumGlConnectionPointType.BOOL]: Readonly<'bool'>;
// 	// BVEC2 = 'bvec2',
// 	// BVEC3 = 'bvec3',
// 	// BVEC4 = 'bvec4',
// 	[EnumGlConnectionPointType.INT]: Readonly<'int'>;
// 	// IVEC2 = 'ivec2',
// 	// IVEC3 = 'ivec3',
// 	// IVEC4 = 'ivec4',
// 	[EnumGlConnectionPointType.FLOAT]: Readonly<'float'>;
// 	[EnumGlConnectionPointType.VEC2]: Readonly<'vec2'>;
// 	[EnumGlConnectionPointType.VEC3]: Readonly<'vec3'>;
// 	[EnumGlConnectionPointType.VEC4]: Readonly<'vec4'>;
// 	// matrices to be used later
// 	// MAT2 = 'mat2',
// 	// MAT3 = 'mat3',
// 	// MAT4 = 'mat4',
// 	[EnumGlConnectionPointType.SAMPLER_2D]: Readonly<'sampler2D'>;
// }

// export const GlConnectionPointType: IGlConnectionPointType = {
// 	[EnumGlConnectionPointType.BOOL]: 'bool',
// 	// BVEC2 = 'bvec2',
// 	// BVEC3 = 'bvec3',
// 	// BVEC4 = 'bvec4',
// 	[EnumGlConnectionPointType.INT]: 'int',
// 	// IVEC2 = 'ivec2',
// 	// IVEC3 = 'ivec3',
// 	// IVEC4 = 'ivec4',
// 	[EnumGlConnectionPointType.FLOAT]: 'float',
// 	[EnumGlConnectionPointType.VEC2]: 'vec2',
// 	[EnumGlConnectionPointType.VEC3]: 'vec3',
// 	[EnumGlConnectionPointType.VEC4]: 'vec4',
// 	// matrices to be used later
// 	// MAT2 = 'mat2',
// 	// MAT3 = 'mat3',
// 	// MAT4 = 'mat4',
// 	[EnumGlConnectionPointType.SAMPLER_2D]: 'sampler2D',
// };

//
//
// ALL GL Data types in an array
//
//
export const GL_CONNECTION_POINT_TYPES: Array<GlConnectionPointType> = [
	GlConnectionPointType.BOOL,
	// ConnectionPointType.BVEC2,
	// ConnectionPointType.BVEC3,
	// ConnectionPointType.BVEC4,
	GlConnectionPointType.INT,
	// ConnectionPointType.IVEC2,
	// ConnectionPointType.IVEC3,
	// ConnectionPointType.IVEC4,
	GlConnectionPointType.FLOAT,
	GlConnectionPointType.VEC2,
	GlConnectionPointType.VEC3,
	GlConnectionPointType.VEC4,
	GlConnectionPointType.SAMPLER_2D,
	GlConnectionPointType.SSS_MODEL,
	GlConnectionPointType.SDF_CONTEXT,
	GlConnectionPointType.SDF_MATERIAL,
];

//
//
// Map to convert from a GL Data type to a ParamType
//
//
type GlConnectionPointTypeToParamTypeMapGeneric = {[key in GlConnectionPointType]: ParamType};
export interface GlIConnectionPointTypeToParamTypeMap extends GlConnectionPointTypeToParamTypeMapGeneric {
	[GlConnectionPointType.BOOL]: ParamType.BOOLEAN;
	// [ConnectionPointType.BVEC2]: [ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC3]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC4]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	[GlConnectionPointType.INT]: ParamType.INTEGER;
	// [ConnectionPointType.IVEC2]: [ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC3]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC4]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	[GlConnectionPointType.FLOAT]: ParamType.FLOAT;
	[GlConnectionPointType.VEC2]: ParamType.VECTOR2;
	[GlConnectionPointType.VEC3]: ParamType.VECTOR3;
	[GlConnectionPointType.VEC4]: ParamType.VECTOR4;
}
export const GlConnectionPointTypeToParamTypeMap: GlIConnectionPointTypeToParamTypeMap = {
	[GlConnectionPointType.BOOL]: ParamType.BOOLEAN,
	// [ConnectionPointType.BVEC2]: [ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC3]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC4]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	[GlConnectionPointType.INT]: ParamType.INTEGER,
	// [ConnectionPointType.IVEC2]: [ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC3]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC4]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	[GlConnectionPointType.FLOAT]: ParamType.FLOAT,
	[GlConnectionPointType.VEC2]: ParamType.VECTOR2,
	[GlConnectionPointType.VEC3]: ParamType.VECTOR3,
	[GlConnectionPointType.VEC4]: ParamType.VECTOR4,

	[GlConnectionPointType.SAMPLER_2D]: ParamType.RAMP,
	[GlConnectionPointType.SAMPLER_3D]: ParamType.RAMP,
	[GlConnectionPointType.SAMPLER_CUBE]: ParamType.RAMP,
	[GlConnectionPointType.SSS_MODEL]: ParamType.STRING,
	[GlConnectionPointType.SDF_CONTEXT]: ParamType.STRING,
	[GlConnectionPointType.SDF_MATERIAL]: ParamType.STRING,
};

//
//
// Map to convert from a ParamType to GL Data type
//
//
type GLParamTypeToConnectionPointTypeMapGeneric = {[key in ParamType]: GlConnectionPointType | undefined};
export interface IGLParamTypeToConnectionPointTypeMap extends GLParamTypeToConnectionPointTypeMapGeneric {
	[ParamType.BOOLEAN]: GlConnectionPointType.BOOL;
	[ParamType.COLOR]: GlConnectionPointType.VEC3;
	// [ConnectionPointType.BVEC2]: [ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC3]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC4]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	[ParamType.INTEGER]: GlConnectionPointType.INT;
	// [ConnectionPointType.IVEC2]: [ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC3]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC4]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	[ParamType.FLOAT]: GlConnectionPointType.FLOAT;
	[ParamType.FOLDER]: undefined;
	[ParamType.VECTOR2]: GlConnectionPointType.VEC2;
	[ParamType.VECTOR3]: GlConnectionPointType.VEC3;
	[ParamType.VECTOR4]: GlConnectionPointType.VEC4;
	[ParamType.BUTTON]: undefined;
	// [ParamType.OPERATOR_PATH]: undefined;
	[ParamType.NODE_PATH]: undefined;
	[ParamType.PARAM_PATH]: undefined;
	[ParamType.RAMP]: undefined;
	[ParamType.STRING]: undefined;
}
export const GLParamTypeToConnectionPointTypeMap: IGLParamTypeToConnectionPointTypeMap = {
	[ParamType.BOOLEAN]: GlConnectionPointType.BOOL,
	[ParamType.COLOR]: GlConnectionPointType.VEC3,
	// [ConnectionPointType.BVEC2]: [ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC3]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC4]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	[ParamType.INTEGER]: GlConnectionPointType.INT,
	// [ConnectionPointType.IVEC2]: [ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC3]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC4]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	[ParamType.FLOAT]: GlConnectionPointType.FLOAT,
	[ParamType.FOLDER]: undefined,
	[ParamType.VECTOR2]: GlConnectionPointType.VEC2,
	[ParamType.VECTOR3]: GlConnectionPointType.VEC3,
	[ParamType.VECTOR4]: GlConnectionPointType.VEC4,
	[ParamType.BUTTON]: undefined,
	// [ParamType.OPERATOR_PATH]: undefined,
	[ParamType.PARAM_PATH]: undefined,
	[ParamType.NODE_PATH]: undefined,
	[ParamType.RAMP]: undefined,
	[ParamType.STRING]: undefined,
};

//
//
// Map of GL Data type default values
//
//
export type GlConnectionPointInitValueMapGeneric = {
	[key in GlConnectionPointType]: ParamInitValuesTypeMap[GlIConnectionPointTypeToParamTypeMap[key]];
};
export const GlConnectionPointInitValueMap: GlConnectionPointInitValueMapGeneric = {
	[GlConnectionPointType.BOOL]: false,
	// [ConnectionPointType.BVEC2]: [ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC3]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC4]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	[GlConnectionPointType.INT]: 0,
	// [ConnectionPointType.IVEC2]: [ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC3]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC4]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	[GlConnectionPointType.FLOAT]: 0,
	[GlConnectionPointType.VEC2]: [0, 0],
	[GlConnectionPointType.VEC3]: [0, 0, 0],
	[GlConnectionPointType.VEC4]: [0, 0, 0, 0],

	[GlConnectionPointType.SAMPLER_2D]: RampParam.DEFAULT_VALUE_JSON,
	[GlConnectionPointType.SAMPLER_3D]: RampParam.DEFAULT_VALUE_JSON,
	[GlConnectionPointType.SAMPLER_CUBE]: RampParam.DEFAULT_VALUE_JSON,
	[GlConnectionPointType.SSS_MODEL]: 'SSSModel()',
	[GlConnectionPointType.SDF_CONTEXT]: 'DefaultSDFContext()',
	[GlConnectionPointType.SDF_MATERIAL]: 'DefaultSDFMaterial()',
};

//
//
// Map of GL Data type component counts
//
//
export type ConnectionPointComponentsCountMapGeneric = {
	[key in GlConnectionPointType]: number;
};
export const GlConnectionPointComponentsCountMap: ConnectionPointComponentsCountMapGeneric = {
	[GlConnectionPointType.BOOL]: 1,
	// [ConnectionPointType.BVEC2]: [ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC3]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	// [ConnectionPointType.BVEC4]: [ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN, ParamType.BOOLEAN]
	[GlConnectionPointType.INT]: 1,
	// [ConnectionPointType.IVEC2]: [ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC3]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	// [ConnectionPointType.IVEC4]: [ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER, ParamType.INTEGER];
	[GlConnectionPointType.FLOAT]: 1,
	[GlConnectionPointType.VEC2]: 2,
	[GlConnectionPointType.VEC3]: 3,
	[GlConnectionPointType.VEC4]: 4,
	[GlConnectionPointType.SAMPLER_2D]: 1,
	[GlConnectionPointType.SAMPLER_3D]: 1,
	[GlConnectionPointType.SAMPLER_CUBE]: 1,
	[GlConnectionPointType.SSS_MODEL]: 1,
	[GlConnectionPointType.SDF_CONTEXT]: 1,
	[GlConnectionPointType.SDF_MATERIAL]: 1,
};

// import {
// ConnectionPointType,
// ConnectionPointInitValueMapGeneric,
// ConnectionPointInitValueMap,
// ConnectionPointTypeToParamTypeMap,
// IConnectionPointTypeToParamTypeMap,
// } from '../ConnectionPointType';
// import {ParamInitValuesTypeMap} from '../params/ParamsController';

export interface GlConnectionPointData<T extends GlConnectionPointType> {
	name: string;
	type: T;
	isArray?: boolean;
}

import {BaseConnectionPoint} from './_Base';
export class GlConnectionPoint<T extends GlConnectionPointType> extends BaseConnectionPoint {
	protected override _json: GlConnectionPointData<T> | undefined;
	// protected _init_value: any;

	constructor(
		protected override _name: string,
		protected override _type: T,
		protected override _init_value?: GlConnectionPointInitValueMapGeneric[T]
	) {
		super(_name, _type);
		// if (this._init_value === undefined) {
		this._init_value = this._init_value || GlConnectionPointInitValueMap[this._type];
		// }
	}
	override type() {
		return this._type;
	}
	override are_types_matched(src_type: string, dest_type: string): boolean {
		return src_type == dest_type;
	}
	get param_type(): GlIConnectionPointTypeToParamTypeMap[T] {
		return GlConnectionPointTypeToParamTypeMap[this._type];
	}
	override get init_value() {
		return this._init_value;
	}

	override toJSON(): GlConnectionPointData<T> {
		return (this._json = this._json || this._create_json());
	}
	protected override _create_json(): GlConnectionPointData<T> {
		return {
			name: this._name,
			type: this._type,
			// isArray: false,
		};
	}
}

export type BaseGlConnectionPoint = GlConnectionPoint<GlConnectionPointType>;
