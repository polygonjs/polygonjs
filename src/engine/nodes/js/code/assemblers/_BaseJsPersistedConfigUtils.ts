import {
	Box3,
	Color,
	Vector2,
	Vector3,
	Vector4,
	Plane,
	Ray,
	Sphere,
	Quaternion,
	Matrix4,
	Euler,
	EulerOrder,
} from 'three';
import {CoreType} from '../../../../../core/Type';
import {Number2, Number3, Number4, Number16} from '../../../../../types/GlobalTypes';
import {TypeAssert} from '../../../../poly/Assert';
import {
	JsConnectionPointType,
	PrimitiveArrayElement,
	VectorArrayElement,
	JsConnectionPointTypeFromArrayTypeMap,
} from '../../../utils/io/connections/Js';
export type RegisterableVariable =
	| Box3
	| Color
	| Euler
	| Plane
	| Quaternion
	| Matrix4
	| Ray
	| Sphere
	| Vector2
	| Vector3
	| Vector4
	| PrimitiveArray<PrimitiveArrayElement>
	| VectorArray<VectorArrayElement>;
// | PrimitiveArray<PrimitiveArrayElement>
// | VectorArray<Color>
// | VectorArray<Matrix4>
// | VectorArray<Quaternion>
// | VectorArray<Vector2>
// | VectorArray<Vector3>
// | VectorArray<Vector4>;

export class PrimitiveArray<V extends PrimitiveArrayElement> {
	constructor(protected _elements: V[]) {}
	elements() {
		return this._elements;
	}
	clone(): V[] {
		return this._elements.map((v) => v as V);
	}
}
export class VectorArray<V extends VectorArrayElement> {
	constructor(protected _elements: V[]) {}
	elements() {
		return this._elements;
	}
	clone(): V[] {
		return this._elements.map((v) => v.clone() as V);
	}
}
// Color | Vector2 | Vector3 | Vector4 | Matrix4 | Quaternion
export function createVariable(type: JsConnectionPointType) {
	switch (type) {
		case JsConnectionPointType.BOOLEAN:
		case JsConnectionPointType.INT:
		case JsConnectionPointType.FLOAT:
		case JsConnectionPointType.STRING: {
			return null;
		}
		case JsConnectionPointType.COLOR: {
			return new Color();
		}
		case JsConnectionPointType.EULER: {
			return new Euler();
		}
		case JsConnectionPointType.MATRIX4: {
			return new Matrix4();
		}
		case JsConnectionPointType.QUATERNION: {
			return new Quaternion();
		}
		case JsConnectionPointType.VECTOR2: {
			return new Vector2();
		}
		case JsConnectionPointType.VECTOR3: {
			return new Vector3();
		}
		case JsConnectionPointType.VECTOR4: {
			return new Vector4();
		}
		case JsConnectionPointType.BOOLEAN_ARRAY:
		case JsConnectionPointType.FLOAT_ARRAY:
		case JsConnectionPointType.INT_ARRAY:
		case JsConnectionPointType.STRING_ARRAY: {
			return createPrimitiveArray(type);
		}
		case JsConnectionPointType.MATRIX4_ARRAY:
		case JsConnectionPointType.QUATERNION_ARRAY:
		case JsConnectionPointType.TEXTURE_ARRAY:
		case JsConnectionPointType.COLOR_ARRAY:
		case JsConnectionPointType.EULER_ARRAY:
		case JsConnectionPointType.VECTOR2_ARRAY:
		case JsConnectionPointType.VECTOR3_ARRAY:
		case JsConnectionPointType.VECTOR4_ARRAY: {
			return createVectorArray(type);
		}
		case JsConnectionPointType.ANIMATION_MIXER:
		case JsConnectionPointType.ANIMATION_ACTION:
		case JsConnectionPointType.BOX3:
		case JsConnectionPointType.CAMERA:
		case JsConnectionPointType.CATMULL_ROM_CURVE3:
		case JsConnectionPointType.INTERSECTION:
		case JsConnectionPointType.INTERSECTION_ARRAY:
		case JsConnectionPointType.MATERIAL:
		case JsConnectionPointType.OBJECT_3D:
		case JsConnectionPointType.PLANE:
		case JsConnectionPointType.RAY:
		case JsConnectionPointType.SPHERE:
		case JsConnectionPointType.TEXTURE:
		case JsConnectionPointType.TEXTURE_ARRAY:
		case JsConnectionPointType.TRIGGER: {
			console.warn('no variable can be created for type', type);
			return null;
		}
	}
	console.warn('createVariable not implemented with type', type);
	TypeAssert.unreachable(type);
}

export function createPrimitiveArray<V extends PrimitiveArrayElement>(type: JsConnectionPointType): PrimitiveArray<V> {
	type = JsConnectionPointTypeFromArrayTypeMap[type];
	switch (type) {
		case JsConnectionPointType.BOOLEAN: {
			return new PrimitiveArray([false]) as PrimitiveArray<V>;
		}
		case JsConnectionPointType.INT: {
			return new PrimitiveArray([0]) as PrimitiveArray<V>;
		}
		case JsConnectionPointType.FLOAT: {
			return new PrimitiveArray([0]) as PrimitiveArray<V>;
		}
		case JsConnectionPointType.STRING: {
			return new PrimitiveArray(['']) as PrimitiveArray<V>;
		}
	}
	console.warn('createPrimitiveArray not implemented for type:', type);
	return new PrimitiveArray([0]) as PrimitiveArray<V>;
}
export function createVectorArray<V extends VectorArrayElement>(type: JsConnectionPointType): VectorArray<V> {
	type = JsConnectionPointTypeFromArrayTypeMap[type];
	switch (type) {
		case JsConnectionPointType.COLOR: {
			return new VectorArray([new Color()]) as VectorArray<V>;
		}
		case JsConnectionPointType.EULER: {
			return new VectorArray([new Euler()]) as VectorArray<V>;
		}
		case JsConnectionPointType.MATRIX4: {
			return new VectorArray([new Matrix4()]) as VectorArray<V>;
		}
		case JsConnectionPointType.QUATERNION: {
			return new VectorArray([new Quaternion()]) as VectorArray<V>;
		}
		case JsConnectionPointType.VECTOR2: {
			return new VectorArray([new Vector2()]) as VectorArray<V>;
		}
		case JsConnectionPointType.VECTOR3: {
			return new VectorArray([new Vector3()]) as VectorArray<V>;
		}
		case JsConnectionPointType.VECTOR4: {
			return new VectorArray([new Vector4()]) as VectorArray<V>;
		}
	}
	console.warn('createVectorArray not implemented for type:', type);
	return new VectorArray([new Vector4()]) as VectorArray<V>;
}

export enum SerializedVariableType {
	Box3 = 'Box3',
	Color = 'Color',
	Euler = 'Euler',
	Matrix4 = 'Matrix4',
	Plane = 'Plane',
	Quaternion = 'Quaternion',
	Ray = 'Ray',
	Sphere = 'Sphere',
	Vector2 = 'Vector2',
	Vector3 = 'Vector3',
	Vector4 = 'Vector4',
	// prim array
	boolean_Array = 'boolean[]',
	number_Array = 'number[]',
	string_Array = 'string[]',
	// vector array
	Color_Array = 'Color[]',
	Euler_Array = 'Euler[]',
	// Intersection_Array = 'Intersection[]',
	Matrix4_Array = 'Matrix4[]',
	Quaternion_Array = 'Quaternion[]',
	// Texture_Array = 'Texture[]',
	Vector2_Array = 'Vector2[]',
	Vector3_Array = 'Vector3[]',
	Vector4_Array = 'Vector4[]',
}
interface EulerSerialized {
	rotation: Number3;
	rotationOrder: EulerOrder;
}
interface SerializedDataByType {
	[SerializedVariableType.Box3]: {min: Number3; max: Number3};
	[SerializedVariableType.Color]: Number3;
	[SerializedVariableType.Euler]: EulerSerialized;
	[SerializedVariableType.Matrix4]: Number16;
	[SerializedVariableType.Plane]: {normal: Number3; constant: number};
	[SerializedVariableType.Quaternion]: Number4;
	[SerializedVariableType.Ray]: {origin: Number3; direction: Number3};
	[SerializedVariableType.Sphere]: {center: Number3; radius: number};
	[SerializedVariableType.Vector2]: Number2;
	[SerializedVariableType.Vector3]: Number3;
	[SerializedVariableType.Vector4]: Number4;
	// prim array
	[SerializedVariableType.boolean_Array]: boolean[];
	[SerializedVariableType.number_Array]: number[];
	[SerializedVariableType.string_Array]: string[];
	// vector array
	[SerializedVariableType.Color_Array]: Number3[];
	[SerializedVariableType.Euler_Array]: EulerSerialized[];
	[SerializedVariableType.Matrix4_Array]: Number16[];
	[SerializedVariableType.Quaternion_Array]: Number4[];
	[SerializedVariableType.Vector2_Array]: Number2[];
	[SerializedVariableType.Vector3_Array]: Number3[];
	[SerializedVariableType.Vector4_Array]: Number4[];
}
interface VariableByType {
	[SerializedVariableType.Box3]: Box3;
	[SerializedVariableType.Color]: Color;
	[SerializedVariableType.Euler]: Euler;
	[SerializedVariableType.Matrix4]: Matrix4;
	[SerializedVariableType.Plane]: Plane;
	[SerializedVariableType.Quaternion]: Quaternion;
	[SerializedVariableType.Ray]: Ray;
	[SerializedVariableType.Sphere]: Sphere;
	[SerializedVariableType.Vector2]: Vector2;
	[SerializedVariableType.Vector3]: Vector3;
	[SerializedVariableType.Vector4]: Vector4;
	// prim array
	[SerializedVariableType.boolean_Array]: PrimitiveArray<boolean>;
	[SerializedVariableType.number_Array]: PrimitiveArray<number>;
	[SerializedVariableType.string_Array]: PrimitiveArray<string>;
	// vector array
	[SerializedVariableType.Color_Array]: VectorArray<Color>;
	[SerializedVariableType.Euler_Array]: VectorArray<Euler>;
	[SerializedVariableType.Matrix4_Array]: VectorArray<Matrix4>;
	[SerializedVariableType.Quaternion_Array]: VectorArray<Quaternion>;
	[SerializedVariableType.Vector2_Array]: VectorArray<Vector2>;
	[SerializedVariableType.Vector3_Array]: VectorArray<Vector3>;
	[SerializedVariableType.Vector4_Array]: VectorArray<Vector4>;
}
type SerializableVariable =
	| Box3
	| Color
	| Euler
	| Matrix4
	| Plane
	| Quaternion
	| Ray
	| Sphere
	| Vector2
	| Vector3
	| Vector4;

export interface SerializedVariable<T extends SerializedVariableType> {
	type: SerializedVariableType;
	data: SerializedDataByType[T];
}

export function isVariableSerializable(variable: any): variable is SerializableVariable {
	if (
		variable instanceof Box3 ||
		variable instanceof Color ||
		variable instanceof Euler ||
		variable instanceof Matrix4 ||
		variable instanceof Plane ||
		variable instanceof Quaternion ||
		variable instanceof Ray ||
		variable instanceof Sphere ||
		variable instanceof Vector2 ||
		variable instanceof Vector3 ||
		variable instanceof Vector4 ||
		variable instanceof PrimitiveArray ||
		variable instanceof VectorArray
	) {
		return true;
	} else {
		console.warn('not serializable', variable);
		return false;
	}
}

export function serializeVariable<T extends SerializedVariableType>(
	variable: VariableByType[T]
): SerializedVariable<T> {
	if (variable instanceof Box3) {
		const data: SerializedVariable<SerializedVariableType.Box3> = {
			type: SerializedVariableType.Box3,
			data: {
				min: variable.min.toArray() as Number3,
				max: variable.min.toArray() as Number3,
			},
		};
		return data as SerializedVariable<T>;
	}
	if (variable instanceof Color) {
		const data: SerializedVariable<SerializedVariableType.Color> = {
			type: SerializedVariableType.Color,
			data: variable.toArray() as Number3,
		};
		return data as SerializedVariable<T>;
	}
	if (variable instanceof Euler) {
		const data: SerializedVariable<SerializedVariableType.Euler> = {
			type: SerializedVariableType.Euler,
			data: {
				rotation: variable.toArray() as Number3,
				rotationOrder: variable.order,
			},
		};
		return data as SerializedVariable<T>;
	}
	if (variable instanceof Matrix4) {
		const data: SerializedVariable<SerializedVariableType.Matrix4> = {
			type: SerializedVariableType.Matrix4,
			data: variable.toArray() as Number16,
		};
		return data as SerializedVariable<T>;
	}
	if (variable instanceof Plane) {
		const data: SerializedVariable<SerializedVariableType.Plane> = {
			type: SerializedVariableType.Plane,
			data: {
				normal: variable.normal.toArray() as Number3,
				constant: variable.constant,
			},
		};
		return data as SerializedVariable<T>;
	}
	if (variable instanceof Quaternion) {
		const data: SerializedVariable<SerializedVariableType.Quaternion> = {
			type: SerializedVariableType.Quaternion,
			data: variable.toArray() as Number4,
		};
		return data as SerializedVariable<T>;
	}
	if (variable instanceof Ray) {
		const data: SerializedVariable<SerializedVariableType.Ray> = {
			type: SerializedVariableType.Ray,
			data: {
				origin: variable.origin.toArray() as Number3,
				direction: variable.direction.toArray() as Number3,
			},
		};
		return data as SerializedVariable<T>;
	}
	if (variable instanceof Sphere) {
		const data: SerializedVariable<SerializedVariableType.Sphere> = {
			type: SerializedVariableType.Sphere,
			data: {
				center: variable.center.toArray() as Number3,
				radius: variable.radius,
			},
		};
		return data as SerializedVariable<T>;
	}
	if (variable instanceof Vector2) {
		const data: SerializedVariable<SerializedVariableType.Vector2> = {
			type: SerializedVariableType.Vector2,
			data: variable.toArray() as Number2,
		};
		return data as SerializedVariable<T>;
	}
	if (variable instanceof Vector3) {
		const data: SerializedVariable<SerializedVariableType.Vector3> = {
			type: SerializedVariableType.Vector3,
			data: variable.toArray() as Number3,
		};
		return data as SerializedVariable<T>;
	}
	if (variable instanceof Vector4) {
		const data: SerializedVariable<SerializedVariableType.Vector4> = {
			type: SerializedVariableType.Vector4,
			data: variable.toArray() as Number4,
		};
		return data as SerializedVariable<T>;
	}
	if (variable instanceof PrimitiveArray<any>) {
		const firstElement = variable.elements()[0];
		if (CoreType.isBoolean(firstElement)) {
			const data: SerializedVariable<SerializedVariableType.boolean_Array> = {
				type: SerializedVariableType.boolean_Array,
				data: variable.elements().map((v) => v as boolean),
			};
			return data as SerializedVariable<T>;
		}
		if (CoreType.isNumber(firstElement)) {
			const data: SerializedVariable<SerializedVariableType.number_Array> = {
				type: SerializedVariableType.number_Array,
				data: variable.elements().map((v) => v as number),
			};
			return data as SerializedVariable<T>;
		}
		if (CoreType.isString(firstElement)) {
			const data: SerializedVariable<SerializedVariableType.string_Array> = {
				type: SerializedVariableType.string_Array,
				data: variable.elements().map((v) => v as string),
			};
			return data as SerializedVariable<T>;
		}
	}
	if (variable instanceof VectorArray<any>) {
		const firstElement = variable.elements()[0];
		if (firstElement instanceof Color) {
			const data: SerializedVariable<SerializedVariableType.Color_Array> = {
				type: SerializedVariableType.Color_Array,
				data: variable.elements().map((v) => v.toArray() as Number3),
			};
			return data as SerializedVariable<T>;
		}
		if (firstElement instanceof Euler) {
			const data: SerializedVariable<SerializedVariableType.Euler_Array> = {
				type: SerializedVariableType.Euler_Array,
				data: variable.elements().map((v) => ({
					rotation: v.toArray() as Number3,
					rotationOrder: (v as Euler).order,
				})),
			};
			return data as SerializedVariable<T>;
		}
		if (firstElement instanceof Matrix4) {
			const data: SerializedVariable<SerializedVariableType.Matrix4_Array> = {
				type: SerializedVariableType.Matrix4_Array,
				data: variable.elements().map((v) => v.toArray() as Number16),
			};
			return data as SerializedVariable<T>;
		}
		if (firstElement instanceof Quaternion) {
			const data: SerializedVariable<SerializedVariableType.Quaternion_Array> = {
				type: SerializedVariableType.Quaternion_Array,
				data: variable.elements().map((v) => v.toArray() as Number4),
			};
			return data as SerializedVariable<T>;
		}
		if (firstElement instanceof Vector2) {
			const data: SerializedVariable<SerializedVariableType.Vector2_Array> = {
				type: SerializedVariableType.Vector2_Array,
				data: variable.elements().map((v) => v.toArray() as Number2),
			};
			return data as SerializedVariable<T>;
		}
		if (firstElement instanceof Vector3) {
			const data: SerializedVariable<SerializedVariableType.Vector3_Array> = {
				type: SerializedVariableType.Vector3_Array,
				data: variable.elements().map((v) => v.toArray() as Number3),
			};
			return data as SerializedVariable<T>;
		}
		if (firstElement instanceof Vector4) {
			const data: SerializedVariable<SerializedVariableType.Vector4_Array> = {
				type: SerializedVariableType.Vector4_Array,
				data: variable.elements().map((v) => v.toArray() as Number4),
			};
			return data as SerializedVariable<T>;
		}
		console.log('array variable serialization not implemeted', variable, firstElement);
	}

	console.log('variable serialization not implemeted', variable);

	const data: SerializedVariable<SerializedVariableType.Vector3> = {
		type: SerializedVariableType.Vector3,
		data: new Vector3().toArray() as Number3,
	};
	return data as SerializedVariable<T>;
}
export function deserializeVariable<T extends SerializedVariableType>(
	serialized: SerializedVariable<T>
): VariableByType[T] {
	const type = serialized.type;
	switch (type) {
		case SerializedVariableType.Box3: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Box3>).data;
			const box3 = new Box3();
			box3.min.set(data.min[0], data.min[1], data.min[2]);
			box3.max.set(data.max[0], data.max[1], data.max[2]);
			return box3 as VariableByType[T];
		}
		case SerializedVariableType.Color: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Color>).data;
			const color = new Color();
			color.r = data[0];
			color.g = data[1];
			color.b = data[2];
			return color as VariableByType[T];
		}
		case SerializedVariableType.Euler: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Euler>).data;
			const euler = new Euler(data.rotation[0], data.rotation[1], data.rotation[2], data.rotationOrder);
			return euler as VariableByType[T];
		}
		case SerializedVariableType.Matrix4: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Matrix4>).data;
			const matrix = new Matrix4();
			matrix.set(...data);
			return matrix as VariableByType[T];
		}
		case SerializedVariableType.Plane: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Plane>).data;
			const plane = new Plane();
			plane.normal.set(...data.normal);
			plane.constant = data.constant;
			return plane as VariableByType[T];
		}
		case SerializedVariableType.Quaternion: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Quaternion>).data;
			const vector = new Quaternion();
			vector.set(...data);
			return vector as VariableByType[T];
		}
		case SerializedVariableType.Ray: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Ray>).data;
			const ray = new Ray();
			ray.origin.set(...data.origin);
			ray.direction.set(...data.direction);
			return ray as VariableByType[T];
		}
		case SerializedVariableType.Sphere: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Sphere>).data;
			const sphere = new Sphere();
			sphere.center.set(...data.center);
			sphere.radius = data.radius;
			return sphere as VariableByType[T];
		}
		case SerializedVariableType.Vector2: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Vector2>).data;
			const vector = new Vector2();
			vector.set(...data);
			return vector as VariableByType[T];
		}
		case SerializedVariableType.Vector3: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Vector3>).data;
			const vector = new Vector3();
			vector.set(...data);
			return vector as VariableByType[T];
		}
		case SerializedVariableType.Vector4: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Vector4>).data;
			const vector = new Vector4();
			vector.set(...data);
			return vector as VariableByType[T];
		}
		// prim array
		case SerializedVariableType.boolean_Array: {
			const data = (serialized as SerializedVariable<SerializedVariableType.boolean_Array>).data;
			const values = [...data];
			const numberArray = new PrimitiveArray(values);
			return numberArray as VariableByType[T];
		}
		case SerializedVariableType.number_Array: {
			const data = (serialized as SerializedVariable<SerializedVariableType.number_Array>).data;
			const values = [...data];
			const numberArray = new PrimitiveArray(values);
			return numberArray as VariableByType[T];
		}
		case SerializedVariableType.string_Array: {
			const data = (serialized as SerializedVariable<SerializedVariableType.string_Array>).data;
			const values = [...data];
			const numberArray = new PrimitiveArray(values);
			return numberArray as VariableByType[T];
		}
		// vector array
		case SerializedVariableType.Color_Array: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Color_Array>).data;
			const vectors = data.map((d) => {
				const color = new Color();
				color.r = d[0];
				color.g = d[1];
				color.b = d[2];
				return color;
			});
			const vectorArray = new VectorArray(vectors);
			return vectorArray as VariableByType[T];
		}
		case SerializedVariableType.Euler_Array: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Euler_Array>).data;
			const eulers = data.map((d) => {
				const euler = new Euler(d.rotation[0], d.rotation[1], d.rotation[2], d.rotationOrder);
				return euler;
			});
			const vectorArray = new VectorArray(eulers);
			return vectorArray as VariableByType[T];
		}
		case SerializedVariableType.Matrix4_Array: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Matrix4_Array>).data;
			const vectors = data.map((d) => {
				const v = new Matrix4();
				v.set(...d);
				return v;
			});
			const vectorArray = new VectorArray(vectors);
			return vectorArray as VariableByType[T];
		}
		case SerializedVariableType.Quaternion_Array: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Quaternion_Array>).data;
			const vectors = data.map((d) => {
				const v = new Quaternion();
				v.set(...d);
				return v;
			});
			const vectorArray = new VectorArray(vectors);
			return vectorArray as VariableByType[T];
		}

		case SerializedVariableType.Vector2_Array: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Vector2_Array>).data;
			const vectors = data.map((d) => {
				const v = new Vector2();
				v.set(...d);
				return v;
			});
			const vectorArray = new VectorArray(vectors);
			return vectorArray as VariableByType[T];
		}
		case SerializedVariableType.Vector3_Array: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Vector3_Array>).data;
			const vectors = data.map((d) => {
				const v = new Vector3();
				v.set(...d);
				return v;
			});
			const vectorArray = new VectorArray(vectors);
			return vectorArray as VariableByType[T];
		}
		case SerializedVariableType.Vector4_Array: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Vector4_Array>).data;
			const vectors = data.map((d) => {
				const v = new Vector4();
				v.set(...d);
				return v;
			});
			const vectorArray = new VectorArray(vectors);
			return vectorArray as VariableByType[T];
		}
	}
	TypeAssert.unreachable(type);
}
