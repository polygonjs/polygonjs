//
//
// MATH
//
//
export interface LngLatLike {
	lng: number;
	lat: number;
}

export interface Vector2Like {
	x: number;
	y: number;
}
export interface Vector3Like {
	x: number;
	y: number;
	z: number;
}
export interface Vector4Like {
	x: number;
	y: number;
	z: number;
	w: number;
}
export interface ColorLike {
	r: number;
	g: number;
	b: number;
}
// type BooleanAsNumber = 0 | 1;
export type StringOrNumber = string | number;
export type Boolean2 = [boolean, boolean];
export type Boolean3 = [boolean, boolean, boolean];
export type Boolean4 = [boolean, boolean, boolean, boolean];
export type Number2 = [number, number];
export type Number3 = [number, number, number];
export type Number4 = [number, number, number, number];
export type Number16 = [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number
];

export type StringOrNumber2 = [StringOrNumber, StringOrNumber];
export type StringOrNumber3 = [StringOrNumber, StringOrNumber, StringOrNumber];
export type StringOrNumber4 = [StringOrNumber, StringOrNumber, StringOrNumber, StringOrNumber];

// attrib
export type NumericAttribValueAsArray = Number2 | Number3 | Number4;
export type NumericAttribValueAsVectorLike = Vector2Like | Vector3Like | Vector4Like | ColorLike;
export type NumericAttribValue = number | NumericAttribValueAsVectorLike | NumericAttribValueAsArray;
export type AttribValue = string | NumericAttribValue | boolean;

// mixins
export type Constructor<T = {}> = new (...args: any[]) => T;

// utils
export interface PolyDictionary<T> {
	[Key: string]: T;
}
export type valueof<T> = T[keyof T];

//
//
// GUARDS
//
//
interface typeMap {
	// for mapping from strings to types
	string: string;
	number: number;
	boolean: boolean;
}

type PrimitiveOrConstructor = {new (...args: any[]): any} | keyof typeMap; // 'string' | 'number' | 'boolean' | constructor

// infer the guarded type from a specific case of PrimitiveOrConstructor
export type GuardedType<T extends PrimitiveOrConstructor> = T extends {new (...args: any[]): infer U}
	? U
	: T extends keyof typeMap
	? typeMap[T]
	: never;
