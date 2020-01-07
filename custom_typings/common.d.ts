interface StringsByString {
	[propName: string]: string;
}
interface NumbersByString {
	[propName: string]: number;
}
interface ObjectsByString {
	[propName: string]: object;
}
interface StringsArrayByString {
	[propName: string]: string[];
}
interface NumbersArrayByString {
	[propName: string]: number[];
}

// math
interface Vec2 {
	x: number;
	y: number;
}
interface Vec3 {
	x: number;
	y: number;
	z: number;
}
interface Vec4 {
	x: number;
	y: number;
	z: number;
	w: number;
}
interface Col {
	r: number;
	g: number;
	b: number;
}
interface LngLatLike {
	lng: number;
	lat: number;
}

// attrib
type NumericAttribValue = number | Vec2 | Vec3 | Vec4 | Col;
type AttribValue = string | NumericAttribValue;

// params
// type ParamInputValue = number | string
// type ParamDefaultValue =
// 	| number
// 	| string
// 	| [number, number]
// 	| [number, number, number]
// 	| [number, number, number, number]

declare enum ParamType {
	BUTTON = 'button',
	COLOR = 'color',
	FLOAT = 'float',
	INTEGER = 'integer',
	OPERATOR_PATH = 'operator_path',
	SEPARATOR = 'separator',
	STRING = 'string',
	BOOLEAN = 'boolean',
	VECTOR2 = 'vector2',
	VECTOR3 = 'vector3',
	VECTOR4 = 'vector4',
	RAMP = 'ramp',
}
declare enum NodeContext {
	MANAGER = 'managers',
	OBJECT = 'objects',
	GEOMETRY = 'geometry',
	MATERIAL = 'material',
	COP = 'cop',
	POST = 'post',
	GL = 'gl',
}

// math
interface Vector2Components {
	x: number;
	y: number;
}
interface Vector3Components {
	x: number;
	y: number;
	z: number;
}
interface Vector4Components {
	x: number;
	y: number;
	z: number;
	w: number;
}
interface ColorComponents {
	r: number;
	g: number;
	b: number;
}
type BooleanAsNumber = 0 | 1;
// interface BoxComponents {
// 	min: Vector3Components
// 	max: Vector3Components
// }
