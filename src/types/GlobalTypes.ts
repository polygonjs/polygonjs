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
export type Tuple1<T> = [T];
export type Tuple2<T> = [T, T];
export type Tuple3<T> = [T, T, T];
export type Tuple4<T> = [T, T, T, T];
export type Tuple5<T> = [T, T, T, T, T];
export type Tuple6<T> = [T, T, T, T, T, T];
export type Tuple7<T> = [T, T, T, T, T, T, T];
export type Tuple8<T> = [T, T, T, T, T, T, T, T];
export type Tuple9<T> = [T, T, T, T, T, T, T, T, T];
export type Tuple10<T> = [T, T, T, T, T, T, T, T, T, T];
export type Tuple11<T> = [T, T, T, T, T, T, T, T, T, T, T];
export type Tuple12<T> = [T, T, T, T, T, T, T, T, T, T, T, T];
export type Tuple13<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T];
export type Tuple14<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T, T];
export type Tuple15<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
export type Tuple16<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
export type Tuple17<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
export type Tuple18<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
export type Tuple19<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
export type Tuple20<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
export type Tuple21<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
export type Tuple22<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];

// type BooleanAsNumber = 0 | 1;
export type StringOrNumber = string | number;
export type Boolean2 = Tuple2<boolean>;
export type Boolean3 = Tuple3<boolean>;
export type Boolean4 = Tuple4<boolean>;
export type Number2 = Tuple2<number>;
export type Number3 = Tuple3<number>;
export type Number4 = Tuple4<number>;
export type Number16 = Tuple16<number>;

export type StringOrNumber2 = Tuple2<StringOrNumber>;
export type StringOrNumber3 = Tuple3<StringOrNumber>;
export type StringOrNumber4 = Tuple4<StringOrNumber>;

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
