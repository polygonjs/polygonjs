interface StringsByString {
	[propName: string]: string
}
interface NumbersByString {
	[propName: string]: number
}
interface ObjectsByString {
	[propName: string]: object
}
interface StringsArrayByString {
	[propName: string]: string[]
}
interface NumbersArrayByString {
	[propName: string]: number[]
}

// math
interface Vec2 {
	x: number
	y: number
}
interface Vec3 {
	x: number
	y: number
	z: number
}
interface Vec4 {
	x: number
	y: number
	z: number
	w: number
}
interface Col {
	r: number
	g: number
	b: number
}
interface LngLatLike {
	lng: number
	lat: number
}

// attrib
type NumericAttribValue = number | Vec2 | Vec3 | Vec4 | Col
type AttribValue = string | NumericAttribValue
