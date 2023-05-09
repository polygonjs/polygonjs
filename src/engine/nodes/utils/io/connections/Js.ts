import {Plane} from '@jscad/modeling/src/maths/plane';
import {
	AnimationAction,
	AnimationMixer,
	Box3,
	Camera,
	CatmullRomCurve3,
	Color,
	Matrix4,
	Quaternion,
	Vector2,
	Vector3,
	Vector4,
	Intersection,
	Material,
	Object3D,
	Ray,
	Sphere,
	Texture,
	Euler,
} from 'three';
import {ParamInitValuesTypeMap} from '../../../../params/types/ParamInitValuesTypeMap';
import {ParamType} from '../../../../poly/ParamType';

export enum JsConnectionPointType {
	ANIMATION_MIXER = 'AnimationMixer',
	ANIMATION_ACTION = 'AnimationAction',
	BOOLEAN = 'boolean',
	BOOLEAN_ARRAY = 'boolean[]',
	BOX3 = 'Box3',
	CAMERA = 'Camera',
	CATMULL_ROM_CURVE3 = 'CatmullRomCurve3',
	COLOR = 'Color',
	COLOR_ARRAY = 'Color[]',
	EULER = 'Euler',
	EULER_ARRAY = 'Euler[]',
	FLOAT = 'float',
	FLOAT_ARRAY = 'float[]',
	INT = 'int',
	INT_ARRAY = 'int[]',
	INTERSECTION = 'Intersection',
	INTERSECTION_ARRAY = 'Intersection[]',
	MATERIAL = 'Material',
	MATRIX4 = 'Matrix4',
	MATRIX4_ARRAY = 'Matrix4[]',
	OBJECT_3D = 'Object3D',
	PLANE = 'Plane',
	QUATERNION = 'Quaternion',
	QUATERNION_ARRAY = 'Quaternion[]',
	RAY = 'Ray',
	SPHERE = 'Sphere',
	STRING = 'string',
	STRING_ARRAY = 'string[]',
	TEXTURE = 'Texture',
	TEXTURE_ARRAY = 'Texture[]',
	TRIGGER = 'trigger',
	VECTOR2 = 'Vector2',
	VECTOR2_ARRAY = 'Vector2[]',
	VECTOR3 = 'Vector3',
	VECTOR3_ARRAY = 'Vector3[]',
	VECTOR4 = 'Vector4',
	VECTOR4_ARRAY = 'Vector4[]',
	// MAT3 = 'mat3',
	// MAT4 = 'mat4',
}
export type PrimitiveArrayElement = boolean | number | string;
export type VectorArrayElement = Color | Euler | Matrix4 | Quaternion | Vector2 | Vector3 | Vector4;
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
export function isJsConnectionPointArray(type: JsConnectionPointType) {
	return ARRAY_JS_CONNECTION_TYPES_SET.has(type as JsConnectionPointTypeArray);
}

//
//
// ALL Js Data types in an array
//
//
export const JS_CONNECTION_POINT_TYPES: Array<JsConnectionPointType> = [
	JsConnectionPointType.ANIMATION_MIXER,
	JsConnectionPointType.ANIMATION_ACTION,
	JsConnectionPointType.BOX3,
	JsConnectionPointType.BOOLEAN,
	JsConnectionPointType.BOOLEAN_ARRAY,
	JsConnectionPointType.CAMERA,
	JsConnectionPointType.CATMULL_ROM_CURVE3,
	JsConnectionPointType.COLOR,
	JsConnectionPointType.COLOR_ARRAY,
	JsConnectionPointType.EULER,
	JsConnectionPointType.EULER_ARRAY,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.FLOAT_ARRAY,
	JsConnectionPointType.INT,
	JsConnectionPointType.INT_ARRAY,
	JsConnectionPointType.INTERSECTION,
	JsConnectionPointType.INTERSECTION_ARRAY,
	JsConnectionPointType.MATERIAL,
	JsConnectionPointType.MATRIX4,
	JsConnectionPointType.MATRIX4_ARRAY,
	JsConnectionPointType.OBJECT_3D,
	JsConnectionPointType.PLANE,
	JsConnectionPointType.QUATERNION,
	JsConnectionPointType.QUATERNION_ARRAY,
	JsConnectionPointType.RAY,
	JsConnectionPointType.SPHERE,
	JsConnectionPointType.STRING,
	JsConnectionPointType.STRING_ARRAY,
	JsConnectionPointType.TEXTURE,
	JsConnectionPointType.TEXTURE_ARRAY,
	JsConnectionPointType.TRIGGER,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR2_ARRAY,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR3_ARRAY,
	JsConnectionPointType.VECTOR4,
	JsConnectionPointType.VECTOR4_ARRAY,
	// JsConnectionPointType.MAT3,
	// JsConnectionPointType.MAT4,
];

type JsConnectionPointTypeToArrayTypeMapGeneric = {[key in JsConnectionPointType]: JsConnectionPointType};
export interface JsIConnectionPointTypeToArrayTypeMap extends JsConnectionPointTypeToArrayTypeMapGeneric {
	[JsConnectionPointType.ANIMATION_MIXER]: JsConnectionPointType.ANIMATION_MIXER;
	[JsConnectionPointType.ANIMATION_ACTION]: JsConnectionPointType.ANIMATION_ACTION;
	[JsConnectionPointType.BOOLEAN]: JsConnectionPointType.BOOLEAN_ARRAY;
	[JsConnectionPointType.BOOLEAN_ARRAY]: JsConnectionPointType.BOOLEAN_ARRAY;
	[JsConnectionPointType.BOX3]: JsConnectionPointType.BOX3;
	[JsConnectionPointType.CAMERA]: JsConnectionPointType.CAMERA;
	[JsConnectionPointType.CATMULL_ROM_CURVE3]: JsConnectionPointType.CATMULL_ROM_CURVE3;
	[JsConnectionPointType.COLOR]: JsConnectionPointType.COLOR_ARRAY;
	[JsConnectionPointType.COLOR_ARRAY]: JsConnectionPointType.COLOR_ARRAY;
	[JsConnectionPointType.EULER]: JsConnectionPointType.EULER_ARRAY;
	[JsConnectionPointType.EULER_ARRAY]: JsConnectionPointType.EULER_ARRAY;
	[JsConnectionPointType.FLOAT]: JsConnectionPointType.FLOAT_ARRAY;
	[JsConnectionPointType.FLOAT_ARRAY]: JsConnectionPointType.FLOAT_ARRAY;
	[JsConnectionPointType.INT]: JsConnectionPointType.INT_ARRAY;
	[JsConnectionPointType.INT_ARRAY]: JsConnectionPointType.INT_ARRAY;
	[JsConnectionPointType.INTERSECTION]: JsConnectionPointType.INTERSECTION_ARRAY;
	[JsConnectionPointType.INTERSECTION_ARRAY]: JsConnectionPointType.INTERSECTION_ARRAY;
	[JsConnectionPointType.MATERIAL]: JsConnectionPointType.MATERIAL; //
	[JsConnectionPointType.MATRIX4]: JsConnectionPointType.MATRIX4_ARRAY; //
	[JsConnectionPointType.MATRIX4_ARRAY]: JsConnectionPointType.MATRIX4_ARRAY; //
	[JsConnectionPointType.OBJECT_3D]: JsConnectionPointType.OBJECT_3D; //
	[JsConnectionPointType.PLANE]: JsConnectionPointType.PLANE; //
	[JsConnectionPointType.QUATERNION]: JsConnectionPointType.QUATERNION_ARRAY; //
	[JsConnectionPointType.QUATERNION_ARRAY]: JsConnectionPointType.QUATERNION_ARRAY; //
	[JsConnectionPointType.RAY]: JsConnectionPointType.RAY; //
	[JsConnectionPointType.SPHERE]: JsConnectionPointType.SPHERE; //
	[JsConnectionPointType.STRING]: JsConnectionPointType.STRING_ARRAY;
	[JsConnectionPointType.STRING_ARRAY]: JsConnectionPointType.STRING_ARRAY;
	[JsConnectionPointType.TEXTURE]: JsConnectionPointType.TEXTURE_ARRAY;
	[JsConnectionPointType.TEXTURE_ARRAY]: JsConnectionPointType.TEXTURE_ARRAY;
	[JsConnectionPointType.TRIGGER]: JsConnectionPointType.TRIGGER;
	[JsConnectionPointType.VECTOR2]: JsConnectionPointType.VECTOR2_ARRAY;
	[JsConnectionPointType.VECTOR2_ARRAY]: JsConnectionPointType.VECTOR2_ARRAY;
	[JsConnectionPointType.VECTOR3]: JsConnectionPointType.VECTOR3_ARRAY;
	[JsConnectionPointType.VECTOR3_ARRAY]: JsConnectionPointType.VECTOR3_ARRAY;
	[JsConnectionPointType.VECTOR4]: JsConnectionPointType.VECTOR4_ARRAY;
	[JsConnectionPointType.VECTOR4_ARRAY]: JsConnectionPointType.VECTOR4_ARRAY;
}
export const JsConnectionPointTypeToArrayTypeMap: JsIConnectionPointTypeToArrayTypeMap = {
	[JsConnectionPointType.ANIMATION_MIXER]: JsConnectionPointType.ANIMATION_MIXER,
	[JsConnectionPointType.ANIMATION_ACTION]: JsConnectionPointType.ANIMATION_ACTION,
	[JsConnectionPointType.BOOLEAN]: JsConnectionPointType.BOOLEAN_ARRAY,
	[JsConnectionPointType.BOOLEAN_ARRAY]: JsConnectionPointType.BOOLEAN_ARRAY,
	[JsConnectionPointType.BOX3]: JsConnectionPointType.BOX3,
	[JsConnectionPointType.CAMERA]: JsConnectionPointType.CAMERA,
	[JsConnectionPointType.CATMULL_ROM_CURVE3]: JsConnectionPointType.CATMULL_ROM_CURVE3,
	[JsConnectionPointType.COLOR]: JsConnectionPointType.COLOR_ARRAY,
	[JsConnectionPointType.COLOR_ARRAY]: JsConnectionPointType.COLOR_ARRAY,
	[JsConnectionPointType.EULER]: JsConnectionPointType.EULER_ARRAY,
	[JsConnectionPointType.EULER_ARRAY]: JsConnectionPointType.EULER_ARRAY,
	[JsConnectionPointType.FLOAT]: JsConnectionPointType.FLOAT_ARRAY,
	[JsConnectionPointType.FLOAT_ARRAY]: JsConnectionPointType.FLOAT_ARRAY,
	[JsConnectionPointType.INT]: JsConnectionPointType.INT_ARRAY,
	[JsConnectionPointType.INT_ARRAY]: JsConnectionPointType.INT_ARRAY,
	[JsConnectionPointType.INTERSECTION]: JsConnectionPointType.INTERSECTION_ARRAY,
	[JsConnectionPointType.INTERSECTION_ARRAY]: JsConnectionPointType.INTERSECTION_ARRAY,
	[JsConnectionPointType.MATERIAL]: JsConnectionPointType.MATERIAL,
	[JsConnectionPointType.MATRIX4]: JsConnectionPointType.MATRIX4_ARRAY,
	[JsConnectionPointType.MATRIX4_ARRAY]: JsConnectionPointType.MATRIX4_ARRAY,
	[JsConnectionPointType.OBJECT_3D]: JsConnectionPointType.OBJECT_3D,
	[JsConnectionPointType.PLANE]: JsConnectionPointType.PLANE,
	[JsConnectionPointType.QUATERNION]: JsConnectionPointType.QUATERNION_ARRAY,
	[JsConnectionPointType.QUATERNION_ARRAY]: JsConnectionPointType.QUATERNION_ARRAY,
	[JsConnectionPointType.RAY]: JsConnectionPointType.RAY,
	[JsConnectionPointType.SPHERE]: JsConnectionPointType.SPHERE, //
	[JsConnectionPointType.STRING]: JsConnectionPointType.STRING_ARRAY,
	[JsConnectionPointType.STRING_ARRAY]: JsConnectionPointType.STRING_ARRAY,
	[JsConnectionPointType.TEXTURE]: JsConnectionPointType.TEXTURE_ARRAY,
	[JsConnectionPointType.TEXTURE_ARRAY]: JsConnectionPointType.TEXTURE_ARRAY,
	// [ActorConnectionPointType.TRACKING_RESULT_HAND]: ActorConnectionPointType.TRACKING_RESULT_HAND,
	[JsConnectionPointType.TRIGGER]: JsConnectionPointType.TRIGGER,
	[JsConnectionPointType.VECTOR2]: JsConnectionPointType.VECTOR2_ARRAY,
	[JsConnectionPointType.VECTOR2_ARRAY]: JsConnectionPointType.VECTOR2_ARRAY,
	[JsConnectionPointType.VECTOR3]: JsConnectionPointType.VECTOR3_ARRAY,
	[JsConnectionPointType.VECTOR3_ARRAY]: JsConnectionPointType.VECTOR3_ARRAY,
	[JsConnectionPointType.VECTOR4]: JsConnectionPointType.VECTOR4_ARRAY,
	[JsConnectionPointType.VECTOR4_ARRAY]: JsConnectionPointType.VECTOR4_ARRAY,
};

type JsConnectionPointTypeFromArrayTypeMapGeneric = {[key in JsConnectionPointType]: JsConnectionPointType};
export interface JsIConnectionPointTypeFromArrayTypeMap extends JsConnectionPointTypeFromArrayTypeMapGeneric {
	[JsConnectionPointType.ANIMATION_MIXER]: JsConnectionPointType.ANIMATION_MIXER;
	[JsConnectionPointType.ANIMATION_ACTION]: JsConnectionPointType.ANIMATION_ACTION;
	[JsConnectionPointType.BOOLEAN]: JsConnectionPointType.BOOLEAN;
	[JsConnectionPointType.BOOLEAN_ARRAY]: JsConnectionPointType.BOOLEAN;
	[JsConnectionPointType.BOX3]: JsConnectionPointType.BOX3;
	[JsConnectionPointType.CAMERA]: JsConnectionPointType.CAMERA;
	[JsConnectionPointType.CATMULL_ROM_CURVE3]: JsConnectionPointType.CATMULL_ROM_CURVE3;
	[JsConnectionPointType.COLOR]: JsConnectionPointType.COLOR;
	[JsConnectionPointType.COLOR_ARRAY]: JsConnectionPointType.COLOR;
	[JsConnectionPointType.EULER]: JsConnectionPointType.EULER;
	[JsConnectionPointType.EULER_ARRAY]: JsConnectionPointType.EULER;
	[JsConnectionPointType.FLOAT]: JsConnectionPointType.FLOAT;
	[JsConnectionPointType.FLOAT_ARRAY]: JsConnectionPointType.FLOAT;
	[JsConnectionPointType.INT]: JsConnectionPointType.INT;
	[JsConnectionPointType.INT_ARRAY]: JsConnectionPointType.INT;
	[JsConnectionPointType.INTERSECTION]: JsConnectionPointType.INTERSECTION;
	[JsConnectionPointType.INTERSECTION_ARRAY]: JsConnectionPointType.INTERSECTION;
	[JsConnectionPointType.MATERIAL]: JsConnectionPointType.MATERIAL; //
	[JsConnectionPointType.MATRIX4]: JsConnectionPointType.MATRIX4; //
	[JsConnectionPointType.MATRIX4_ARRAY]: JsConnectionPointType.MATRIX4; //
	[JsConnectionPointType.OBJECT_3D]: JsConnectionPointType.OBJECT_3D; //
	[JsConnectionPointType.PLANE]: JsConnectionPointType.PLANE; //
	[JsConnectionPointType.QUATERNION]: JsConnectionPointType.QUATERNION; //
	[JsConnectionPointType.QUATERNION_ARRAY]: JsConnectionPointType.QUATERNION; //
	[JsConnectionPointType.RAY]: JsConnectionPointType.RAY; //
	[JsConnectionPointType.SPHERE]: JsConnectionPointType.SPHERE; //
	[JsConnectionPointType.STRING]: JsConnectionPointType.STRING;
	[JsConnectionPointType.STRING_ARRAY]: JsConnectionPointType.STRING;
	[JsConnectionPointType.TEXTURE]: JsConnectionPointType.TEXTURE;
	[JsConnectionPointType.TEXTURE_ARRAY]: JsConnectionPointType.TEXTURE;
	[JsConnectionPointType.TRIGGER]: JsConnectionPointType.TRIGGER;
	[JsConnectionPointType.VECTOR2]: JsConnectionPointType.VECTOR2;
	[JsConnectionPointType.VECTOR2_ARRAY]: JsConnectionPointType.VECTOR2;
	[JsConnectionPointType.VECTOR3]: JsConnectionPointType.VECTOR3;
	[JsConnectionPointType.VECTOR3_ARRAY]: JsConnectionPointType.VECTOR3;
	[JsConnectionPointType.VECTOR4]: JsConnectionPointType.VECTOR4;
	[JsConnectionPointType.VECTOR4_ARRAY]: JsConnectionPointType.VECTOR4;
}
export const JsConnectionPointTypeFromArrayTypeMap: JsIConnectionPointTypeFromArrayTypeMap = {
	[JsConnectionPointType.ANIMATION_MIXER]: JsConnectionPointType.ANIMATION_MIXER,
	[JsConnectionPointType.ANIMATION_ACTION]: JsConnectionPointType.ANIMATION_ACTION,
	[JsConnectionPointType.BOOLEAN]: JsConnectionPointType.BOOLEAN,
	[JsConnectionPointType.BOOLEAN_ARRAY]: JsConnectionPointType.BOOLEAN,
	[JsConnectionPointType.BOX3]: JsConnectionPointType.BOX3,
	[JsConnectionPointType.CAMERA]: JsConnectionPointType.CAMERA,
	[JsConnectionPointType.CATMULL_ROM_CURVE3]: JsConnectionPointType.CATMULL_ROM_CURVE3,
	[JsConnectionPointType.COLOR]: JsConnectionPointType.COLOR,
	[JsConnectionPointType.COLOR_ARRAY]: JsConnectionPointType.COLOR,
	[JsConnectionPointType.EULER]: JsConnectionPointType.EULER,
	[JsConnectionPointType.EULER_ARRAY]: JsConnectionPointType.EULER,
	[JsConnectionPointType.FLOAT]: JsConnectionPointType.FLOAT,
	[JsConnectionPointType.FLOAT_ARRAY]: JsConnectionPointType.FLOAT,
	[JsConnectionPointType.INT]: JsConnectionPointType.INT,
	[JsConnectionPointType.INT_ARRAY]: JsConnectionPointType.INT,
	[JsConnectionPointType.INTERSECTION]: JsConnectionPointType.INTERSECTION,
	[JsConnectionPointType.INTERSECTION_ARRAY]: JsConnectionPointType.INTERSECTION,
	[JsConnectionPointType.MATERIAL]: JsConnectionPointType.MATERIAL,
	[JsConnectionPointType.MATRIX4]: JsConnectionPointType.MATRIX4,
	[JsConnectionPointType.MATRIX4_ARRAY]: JsConnectionPointType.MATRIX4,
	[JsConnectionPointType.OBJECT_3D]: JsConnectionPointType.OBJECT_3D,
	[JsConnectionPointType.PLANE]: JsConnectionPointType.PLANE,
	[JsConnectionPointType.QUATERNION]: JsConnectionPointType.QUATERNION,
	[JsConnectionPointType.QUATERNION_ARRAY]: JsConnectionPointType.QUATERNION,
	[JsConnectionPointType.RAY]: JsConnectionPointType.RAY,
	[JsConnectionPointType.SPHERE]: JsConnectionPointType.SPHERE, //
	[JsConnectionPointType.STRING]: JsConnectionPointType.STRING,
	[JsConnectionPointType.STRING_ARRAY]: JsConnectionPointType.STRING,
	[JsConnectionPointType.TEXTURE]: JsConnectionPointType.TEXTURE,
	[JsConnectionPointType.TEXTURE_ARRAY]: JsConnectionPointType.TEXTURE,
	// [ActorConnectionPointType.TRACKING_RESULT_HAND]: ActorConnectionPointType.TRACKING_RESULT_HAND,
	[JsConnectionPointType.TRIGGER]: JsConnectionPointType.TRIGGER,
	[JsConnectionPointType.VECTOR2]: JsConnectionPointType.VECTOR2,
	[JsConnectionPointType.VECTOR2_ARRAY]: JsConnectionPointType.VECTOR2,
	[JsConnectionPointType.VECTOR3]: JsConnectionPointType.VECTOR3,
	[JsConnectionPointType.VECTOR3_ARRAY]: JsConnectionPointType.VECTOR3,
	[JsConnectionPointType.VECTOR4]: JsConnectionPointType.VECTOR4,
	[JsConnectionPointType.VECTOR4_ARRAY]: JsConnectionPointType.VECTOR4,
};

export type ArrayableConnectionPointType =
	| JsConnectionPointType.BOOLEAN
	| JsConnectionPointType.COLOR
	| JsConnectionPointType.FLOAT
	| JsConnectionPointType.INT
	| JsConnectionPointType.INTERSECTION
	| JsConnectionPointType.MATRIX4
	| JsConnectionPointType.QUATERNION
	| JsConnectionPointType.STRING
	| JsConnectionPointType.TEXTURE
	| JsConnectionPointType.VECTOR2
	| JsConnectionPointType.VECTOR3
	| JsConnectionPointType.VECTOR4;
export const ARRAYABLE_CONNECTION_TYPES: Set<ArrayableConnectionPointType> = new Set([
	JsConnectionPointType.BOOLEAN,
	JsConnectionPointType.COLOR,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.INT,
	JsConnectionPointType.INTERSECTION,
	JsConnectionPointType.MATRIX4,
	JsConnectionPointType.QUATERNION,
	JsConnectionPointType.STRING,
	JsConnectionPointType.TEXTURE,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
]);
export type JsConnectionPointTypeArray =
	| JsConnectionPointType.BOOLEAN_ARRAY
	| JsConnectionPointType.COLOR_ARRAY
	| JsConnectionPointType.FLOAT_ARRAY
	| JsConnectionPointType.INT_ARRAY
	| JsConnectionPointType.INTERSECTION_ARRAY
	| JsConnectionPointType.MATRIX4_ARRAY
	| JsConnectionPointType.QUATERNION_ARRAY
	| JsConnectionPointType.STRING_ARRAY
	| JsConnectionPointType.TEXTURE_ARRAY
	| JsConnectionPointType.VECTOR2_ARRAY
	| JsConnectionPointType.VECTOR3_ARRAY
	| JsConnectionPointType.VECTOR4_ARRAY;

export const ARRAY_JS_CONNECTION_TYPES: Array<JsConnectionPointTypeArray> = [
	JsConnectionPointType.BOOLEAN_ARRAY,
	JsConnectionPointType.COLOR_ARRAY,
	JsConnectionPointType.FLOAT_ARRAY,
	JsConnectionPointType.INT_ARRAY,
	JsConnectionPointType.INTERSECTION_ARRAY,
	JsConnectionPointType.MATRIX4_ARRAY,
	JsConnectionPointType.QUATERNION_ARRAY,
	JsConnectionPointType.STRING_ARRAY,
	JsConnectionPointType.TEXTURE_ARRAY,
	JsConnectionPointType.VECTOR2_ARRAY,
	JsConnectionPointType.VECTOR3_ARRAY,
	JsConnectionPointType.VECTOR4_ARRAY,
];

export const ARRAY_JS_CONNECTION_TYPES_SET: Set<JsConnectionPointTypeArray> = new Set(ARRAY_JS_CONNECTION_TYPES);

export type ParamConvertibleJsType =
	| JsConnectionPointType.BOOLEAN
	| JsConnectionPointType.COLOR
	| JsConnectionPointType.FLOAT
	| JsConnectionPointType.INT
	| JsConnectionPointType.STRING
	| JsConnectionPointType.VECTOR2
	| JsConnectionPointType.VECTOR3
	| JsConnectionPointType.VECTOR4;
export const PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES: Array<ParamConvertibleJsType> = [
	JsConnectionPointType.BOOLEAN,
	JsConnectionPointType.COLOR,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.INT,
	JsConnectionPointType.STRING,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];

//
//
// GET DATA TYPE
//
//
export type JsDataType =
	| PrimitiveArrayElement
	| Array<PrimitiveArrayElement>
	| VectorArrayElement
	| Array<VectorArrayElement>
	| AnimationMixer
	| AnimationAction
	| Box3
	| Camera
	| CatmullRomCurve3
	| Euler
	| Euler[]
	| Intersection
	| Array<Intersection>
	| Material
	| Object3D
	| Ray
	| Sphere
	| Texture
	| Array<Texture>
	| null;
type JSConnectionPointTypeToDataTypeMapGeneric = {[key in JsConnectionPointType]: JsDataType};
export interface JsIConnectionPointTypeToDataTypeMap extends JSConnectionPointTypeToDataTypeMapGeneric {
	[JsConnectionPointType.ANIMATION_MIXER]: AnimationMixer;
	[JsConnectionPointType.ANIMATION_ACTION]: AnimationAction;
	[JsConnectionPointType.BOOLEAN]: boolean;
	[JsConnectionPointType.BOOLEAN_ARRAY]: boolean[];
	[JsConnectionPointType.BOX3]: Box3;
	[JsConnectionPointType.CAMERA]: Camera;
	[JsConnectionPointType.CATMULL_ROM_CURVE3]: CatmullRomCurve3;
	[JsConnectionPointType.COLOR]: Color;
	[JsConnectionPointType.COLOR_ARRAY]: Color[];
	[JsConnectionPointType.EULER]: Euler;
	[JsConnectionPointType.EULER_ARRAY]: Euler[];
	[JsConnectionPointType.FLOAT]: number;
	[JsConnectionPointType.FLOAT_ARRAY]: number[];
	[JsConnectionPointType.INT]: number;
	[JsConnectionPointType.INT_ARRAY]: number[];
	[JsConnectionPointType.INTERSECTION]: Intersection;
	[JsConnectionPointType.INTERSECTION_ARRAY]: Intersection[];
	[JsConnectionPointType.MATERIAL]: Material;
	[JsConnectionPointType.MATRIX4]: Matrix4;
	[JsConnectionPointType.MATRIX4_ARRAY]: Matrix4[];
	[JsConnectionPointType.OBJECT_3D]: Object3D;
	[JsConnectionPointType.PLANE]: Plane;
	[JsConnectionPointType.QUATERNION]: Quaternion;
	[JsConnectionPointType.QUATERNION_ARRAY]: Quaternion[];
	[JsConnectionPointType.RAY]: Ray;
	[JsConnectionPointType.SPHERE]: Sphere;
	[JsConnectionPointType.STRING]: string;
	[JsConnectionPointType.STRING_ARRAY]: string[];
	[JsConnectionPointType.TEXTURE]: Texture;
	[JsConnectionPointType.TEXTURE_ARRAY]: Texture[];
	[JsConnectionPointType.TRIGGER]: null;
	[JsConnectionPointType.VECTOR2]: Vector2;
	[JsConnectionPointType.VECTOR2_ARRAY]: Vector2[];
	[JsConnectionPointType.VECTOR3]: Vector3;
	[JsConnectionPointType.VECTOR3_ARRAY]: Vector3[];
	[JsConnectionPointType.VECTOR4]: Vector4;
	[JsConnectionPointType.VECTOR4_ARRAY]: Vector4[];
}
// export const JsConnectionPointTypeToParamTypeMap: JsIConnectionPointTypeToDataTypeMap = {
// 	[JsConnectionPointType.ANIMATION_MIXER]: AnimationMixer;
// 	[JsConnectionPointType.ANIMATION_ACTION]: AnimationAction;
// 	[JsConnectionPointType.BOOLEAN]: boolean,
// 	[JsConnectionPointType.BOOLEAN_ARRAY]: boolean[],
// 	[JsConnectionPointType.BOX3]: Box3,
// 	[JsConnectionPointType.CAMERA]: Camera,
// 	[JsConnectionPointType.CATMULL_ROM_CURVE3]: ParamType.BUTTON,
// 	[JsConnectionPointType.COLOR]: ParamType.COLOR,
// 	[JsConnectionPointType.COLOR_ARRAY]: ParamType.BUTTON,
// 	[JsConnectionPointType.FLOAT]: ParamType.FLOAT,
// 	[JsConnectionPointType.FLOAT_ARRAY]: ParamType.BUTTON,
// 	[JsConnectionPointType.INT]: ParamType.INTEGER,
// 	[JsConnectionPointType.INT_ARRAY]: ParamType.BUTTON,
// 	[JsConnectionPointType.INTERSECTION]: ParamType.BUTTON,
// 	[JsConnectionPointType.INTERSECTION_ARRAY]: ParamType.BUTTON,
// 	[JsConnectionPointType.MATERIAL]: ParamType.BUTTON,
// 	[JsConnectionPointType.MATRIX4]: ParamType.BUTTON,
// 	[JsConnectionPointType.MATRIX4_ARRAY]: ParamType.BUTTON,
// 	[JsConnectionPointType.OBJECT_3D]: ParamType.BUTTON,
// 	[JsConnectionPointType.PLANE]: ParamType.BUTTON,
// 	[JsConnectionPointType.QUATERNION]: ParamType.BUTTON,
// 	[JsConnectionPointType.QUATERNION_ARRAY]: ParamType.BUTTON,
// 	[JsConnectionPointType.RAY]: ParamType.BUTTON,
// 	[JsConnectionPointType.SPHERE]: ParamType.BUTTON,
// 	[JsConnectionPointType.STRING]: ParamType.STRING,
// 	[JsConnectionPointType.STRING_ARRAY]: ParamType.BUTTON,
// 	[JsConnectionPointType.TEXTURE]: ParamType.BUTTON,
// 	[JsConnectionPointType.TEXTURE_ARRAY]: ParamType.BUTTON,
// 	[JsConnectionPointType.TRIGGER]: ParamType.BUTTON,
// 	[JsConnectionPointType.VECTOR2]: ParamType.VECTOR2,
// 	[JsConnectionPointType.VECTOR2_ARRAY]: ParamType.BUTTON,
// 	[JsConnectionPointType.VECTOR3]: ParamType.VECTOR3,
// 	[JsConnectionPointType.VECTOR3_ARRAY]: ParamType.BUTTON,
// 	[JsConnectionPointType.VECTOR4]: ParamType.VECTOR4,
// 	[JsConnectionPointType.VECTOR4_ARRAY]: ParamType.BUTTON,
// 	// [JsConnectionPointType.MAT3]: undefined,
// 	// [JsConnectionPointType.MAT4]: undefined,
// };

//
//
// Map to convert from a Js Data type to a ParamType
//
//
type JSConnectionPointTypeToParamTypeMapGeneric = {[key in JsConnectionPointType]: ParamType | undefined};
export interface JsIConnectionPointTypeToParamTypeMap extends JSConnectionPointTypeToParamTypeMapGeneric {
	[JsConnectionPointType.ANIMATION_MIXER]: ParamType.BUTTON;
	[JsConnectionPointType.ANIMATION_ACTION]: ParamType.BUTTON;
	[JsConnectionPointType.BOOLEAN]: ParamType.BOOLEAN;
	[JsConnectionPointType.BOOLEAN_ARRAY]: ParamType.BUTTON;
	[JsConnectionPointType.BOX3]: ParamType.BUTTON;
	[JsConnectionPointType.CAMERA]: ParamType.BUTTON;
	[JsConnectionPointType.CATMULL_ROM_CURVE3]: ParamType.BUTTON;
	[JsConnectionPointType.COLOR]: ParamType.COLOR;
	[JsConnectionPointType.COLOR_ARRAY]: ParamType.BUTTON;
	[JsConnectionPointType.EULER]: ParamType.BUTTON;
	[JsConnectionPointType.EULER_ARRAY]: ParamType.BUTTON;
	[JsConnectionPointType.FLOAT]: ParamType.FLOAT;
	[JsConnectionPointType.FLOAT_ARRAY]: ParamType.BUTTON;
	[JsConnectionPointType.INT]: ParamType.INTEGER;
	[JsConnectionPointType.INT_ARRAY]: ParamType.BUTTON;
	[JsConnectionPointType.INTERSECTION]: ParamType.BUTTON;
	[JsConnectionPointType.INTERSECTION_ARRAY]: ParamType.BUTTON;
	[JsConnectionPointType.MATERIAL]: ParamType.BUTTON;
	[JsConnectionPointType.MATRIX4]: ParamType.BUTTON;
	[JsConnectionPointType.MATRIX4_ARRAY]: ParamType.BUTTON;
	[JsConnectionPointType.OBJECT_3D]: ParamType.BUTTON;
	[JsConnectionPointType.PLANE]: ParamType.BUTTON;
	[JsConnectionPointType.QUATERNION]: ParamType.BUTTON;
	[JsConnectionPointType.QUATERNION_ARRAY]: ParamType.BUTTON;
	[JsConnectionPointType.RAY]: ParamType.BUTTON;
	[JsConnectionPointType.SPHERE]: ParamType.BUTTON;
	[JsConnectionPointType.STRING]: ParamType.STRING;
	[JsConnectionPointType.STRING_ARRAY]: ParamType.BUTTON;
	[JsConnectionPointType.TEXTURE]: ParamType.BUTTON;
	[JsConnectionPointType.TEXTURE_ARRAY]: ParamType.BUTTON;
	[JsConnectionPointType.TRIGGER]: ParamType.BUTTON;
	[JsConnectionPointType.VECTOR2]: ParamType.VECTOR2;
	[JsConnectionPointType.VECTOR2_ARRAY]: ParamType.BUTTON;
	[JsConnectionPointType.VECTOR3]: ParamType.VECTOR3;
	[JsConnectionPointType.VECTOR3_ARRAY]: ParamType.BUTTON;
	[JsConnectionPointType.VECTOR4]: ParamType.VECTOR4;
	[JsConnectionPointType.VECTOR4_ARRAY]: ParamType.BUTTON;
	// [JsConnectionPointType.MAT3]: undefined;
	// [JsConnectionPointType.MAT4]: undefined;
}
export const JsConnectionPointTypeToParamTypeMap: JsIConnectionPointTypeToParamTypeMap = {
	[JsConnectionPointType.ANIMATION_MIXER]: ParamType.BUTTON,
	[JsConnectionPointType.ANIMATION_ACTION]: ParamType.BUTTON,
	[JsConnectionPointType.BOOLEAN]: ParamType.BOOLEAN,
	[JsConnectionPointType.BOOLEAN_ARRAY]: ParamType.BUTTON,
	[JsConnectionPointType.BOX3]: ParamType.BUTTON,
	[JsConnectionPointType.CAMERA]: ParamType.BUTTON,
	[JsConnectionPointType.CATMULL_ROM_CURVE3]: ParamType.BUTTON,
	[JsConnectionPointType.COLOR]: ParamType.COLOR,
	[JsConnectionPointType.COLOR_ARRAY]: ParamType.BUTTON,
	[JsConnectionPointType.EULER]: ParamType.BUTTON,
	[JsConnectionPointType.EULER_ARRAY]: ParamType.BUTTON,
	[JsConnectionPointType.FLOAT]: ParamType.FLOAT,
	[JsConnectionPointType.FLOAT_ARRAY]: ParamType.BUTTON,
	[JsConnectionPointType.INT]: ParamType.INTEGER,
	[JsConnectionPointType.INT_ARRAY]: ParamType.BUTTON,
	[JsConnectionPointType.INTERSECTION]: ParamType.BUTTON,
	[JsConnectionPointType.INTERSECTION_ARRAY]: ParamType.BUTTON,
	[JsConnectionPointType.MATERIAL]: ParamType.BUTTON,
	[JsConnectionPointType.MATRIX4]: ParamType.BUTTON,
	[JsConnectionPointType.MATRIX4_ARRAY]: ParamType.BUTTON,
	[JsConnectionPointType.OBJECT_3D]: ParamType.BUTTON,
	[JsConnectionPointType.PLANE]: ParamType.BUTTON,
	[JsConnectionPointType.QUATERNION]: ParamType.BUTTON,
	[JsConnectionPointType.QUATERNION_ARRAY]: ParamType.BUTTON,
	[JsConnectionPointType.RAY]: ParamType.BUTTON,
	[JsConnectionPointType.SPHERE]: ParamType.BUTTON,
	[JsConnectionPointType.STRING]: ParamType.STRING,
	[JsConnectionPointType.STRING_ARRAY]: ParamType.BUTTON,
	[JsConnectionPointType.TEXTURE]: ParamType.BUTTON,
	[JsConnectionPointType.TEXTURE_ARRAY]: ParamType.BUTTON,
	[JsConnectionPointType.TRIGGER]: ParamType.BUTTON,
	[JsConnectionPointType.VECTOR2]: ParamType.VECTOR2,
	[JsConnectionPointType.VECTOR2_ARRAY]: ParamType.BUTTON,
	[JsConnectionPointType.VECTOR3]: ParamType.VECTOR3,
	[JsConnectionPointType.VECTOR3_ARRAY]: ParamType.BUTTON,
	[JsConnectionPointType.VECTOR4]: ParamType.VECTOR4,
	[JsConnectionPointType.VECTOR4_ARRAY]: ParamType.BUTTON,
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
	[JsConnectionPointType.ANIMATION_ACTION]: null,
	[JsConnectionPointType.ANIMATION_MIXER]: null,
	[JsConnectionPointType.BOOLEAN]: false,
	[JsConnectionPointType.BOOLEAN_ARRAY]: null,
	[JsConnectionPointType.BOX3]: null,
	[JsConnectionPointType.CAMERA]: null,
	[JsConnectionPointType.CATMULL_ROM_CURVE3]: null,
	[JsConnectionPointType.COLOR]: [1, 1, 1],
	[JsConnectionPointType.COLOR_ARRAY]: null,
	[JsConnectionPointType.EULER]: null,
	[JsConnectionPointType.EULER_ARRAY]: null,
	[JsConnectionPointType.FLOAT]: 0,
	[JsConnectionPointType.FLOAT_ARRAY]: null,
	[JsConnectionPointType.INT]: 0,
	[JsConnectionPointType.INT_ARRAY]: null,
	[JsConnectionPointType.INTERSECTION]: null,
	[JsConnectionPointType.INTERSECTION_ARRAY]: null,
	[JsConnectionPointType.MATERIAL]: null,
	[JsConnectionPointType.MATRIX4]: null,
	[JsConnectionPointType.MATRIX4_ARRAY]: null,
	[JsConnectionPointType.OBJECT_3D]: null,
	[JsConnectionPointType.PLANE]: null,
	[JsConnectionPointType.QUATERNION]: null,
	[JsConnectionPointType.QUATERNION_ARRAY]: null,
	[JsConnectionPointType.RAY]: null,
	[JsConnectionPointType.SPHERE]: null,
	[JsConnectionPointType.STRING]: '',
	[JsConnectionPointType.STRING_ARRAY]: null,
	[JsConnectionPointType.TEXTURE]: null,
	[JsConnectionPointType.TEXTURE_ARRAY]: null,
	[JsConnectionPointType.TRIGGER]: null,
	[JsConnectionPointType.VECTOR2]: [0, 0],
	[JsConnectionPointType.VECTOR2_ARRAY]: null,
	[JsConnectionPointType.VECTOR3]: [0, 0, 0],
	[JsConnectionPointType.VECTOR3_ARRAY]: null,
	[JsConnectionPointType.VECTOR4]: [0, 0, 0, 0],
	[JsConnectionPointType.VECTOR4_ARRAY]: null,
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
export const JsConnectionPointComponentsCountMap: ConnectionPointComponentsCountMapGeneric = {
	[JsConnectionPointType.ANIMATION_ACTION]: 1,
	[JsConnectionPointType.ANIMATION_MIXER]: 1,
	[JsConnectionPointType.BOOLEAN]: 1,
	[JsConnectionPointType.BOOLEAN_ARRAY]: 1,
	[JsConnectionPointType.BOX3]: 1,
	[JsConnectionPointType.CAMERA]: 1,
	[JsConnectionPointType.CATMULL_ROM_CURVE3]: 1,
	[JsConnectionPointType.COLOR]: 3,
	[JsConnectionPointType.COLOR_ARRAY]: 1,
	[JsConnectionPointType.EULER]: 3,
	[JsConnectionPointType.EULER_ARRAY]: 1,
	[JsConnectionPointType.FLOAT]: 1,
	[JsConnectionPointType.FLOAT_ARRAY]: 1,
	[JsConnectionPointType.INT]: 1,
	[JsConnectionPointType.INT_ARRAY]: 1,
	[JsConnectionPointType.INTERSECTION]: 1,
	[JsConnectionPointType.INTERSECTION_ARRAY]: 1,
	[JsConnectionPointType.MATERIAL]: 1,
	[JsConnectionPointType.MATRIX4]: 1,
	[JsConnectionPointType.MATRIX4_ARRAY]: 1,
	[JsConnectionPointType.OBJECT_3D]: 1,
	[JsConnectionPointType.PLANE]: 1,
	[JsConnectionPointType.QUATERNION]: 1,
	[JsConnectionPointType.QUATERNION_ARRAY]: 1,
	[JsConnectionPointType.RAY]: 1,
	[JsConnectionPointType.SPHERE]: 1,
	[JsConnectionPointType.STRING]: 1,
	[JsConnectionPointType.STRING_ARRAY]: 1,
	[JsConnectionPointType.TEXTURE]: 1,
	[JsConnectionPointType.TEXTURE_ARRAY]: 1,
	[JsConnectionPointType.TRIGGER]: 1,
	[JsConnectionPointType.VECTOR2]: 2,
	[JsConnectionPointType.VECTOR2_ARRAY]: 1,
	[JsConnectionPointType.VECTOR3]: 3,
	[JsConnectionPointType.VECTOR3_ARRAY]: 1,
	[JsConnectionPointType.VECTOR4]: 4,
	[JsConnectionPointType.VECTOR4_ARRAY]: 1,
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
	protected _isArray: boolean;

	constructor(_name: string, protected override _type: T, protected _options?: JsConnectionPointOptions<T>) {
		super(_name, _type);
		// if (this._init_value === undefined) {
		this._isArray = ARRAY_JS_CONNECTION_TYPES_SET.has(_type as JsConnectionPointTypeArray);
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
			isArray: this._isArray,
		};
	}
}

export type BaseJsConnectionPoint = JsConnectionPoint<JsConnectionPointType>;
