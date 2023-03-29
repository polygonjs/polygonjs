import {Color, Vector2, Vector3, Vector4, Plane, Ray} from 'three';
import {Number2, Number3, Number4} from '../../../../../types/GlobalTypes';
import {TypeAssert} from '../../../../poly/Assert';
export type RegisterableVariable = Color | Plane | Ray | Vector2 | Vector3 | Vector4;

export enum SerializedVariableType {
	Color = 'Color',
	Plane = 'Plane',
	Ray = 'Ray',
	Vector2 = 'Vector2',
	Vector3 = 'Vector3',
	Vector4 = 'Vector4',
}

interface SerializedDataByType {
	[SerializedVariableType.Color]: Number3;
	[SerializedVariableType.Plane]: {normal: Number3; constant: number};
	[SerializedVariableType.Ray]: {origin: Number3; direction: Number3};
	[SerializedVariableType.Vector2]: Number2;
	[SerializedVariableType.Vector3]: Number3;
	[SerializedVariableType.Vector4]: Number4;
}
interface VariableByType {
	[SerializedVariableType.Color]: Color;
	[SerializedVariableType.Plane]: Plane;
	[SerializedVariableType.Ray]: Ray;
	[SerializedVariableType.Vector2]: Vector2;
	[SerializedVariableType.Vector3]: Vector3;
	[SerializedVariableType.Vector4]: Vector4;
}

export interface SerializedVariable<T extends SerializedVariableType> {
	type: SerializedVariableType;
	data: SerializedDataByType[T];
}

export function serializeVariable<T extends SerializedVariableType>(
	variable: VariableByType[T]
): SerializedVariable<T> {
	if (variable instanceof Color) {
		const data: SerializedVariable<SerializedVariableType.Color> = {
			type: SerializedVariableType.Color,
			data: variable.toArray() as Number3,
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
		case SerializedVariableType.Color: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Color>).data;
			const color = new Color();
			color.r = data[0];
			color.g = data[1];
			color.b = data[2];
			return color as VariableByType[T];
		}
		case SerializedVariableType.Plane: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Plane>).data;
			const plane = new Plane();
			plane.normal.set(...data.normal);
			plane.constant = data.constant;
			return plane as VariableByType[T];
		}
		case SerializedVariableType.Ray: {
			const data = (serialized as SerializedVariable<SerializedVariableType.Ray>).data;
			const ray = new Ray();
			ray.origin.set(...data.origin);
			ray.direction.set(...data.direction);
			return ray as VariableByType[T];
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
	}
	TypeAssert.unreachable(type);
}
