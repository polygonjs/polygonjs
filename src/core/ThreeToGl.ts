import {CoreString} from './String';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {Color} from 'three/src/math/Color';
import { CoreType } from './Type';

export class ThreeToGl {
	static any(value: any): string {
		if (CoreType.isString(value)) {
			return value;
		}
		if (CoreType.isBoolean(value)) {
			return `${value}`;
		}
		if (CoreType.isNumber(value)) {
			return `${CoreString.ensure_float(value)}`;
		}
		if (CoreType.isArray(value)) {
			return this.numeric_array(value);
		}
		// and if it is a vector
		if (
			value instanceof Vector2 ||
			value instanceof Vector3 ||
			value instanceof Vector4 ||
			value instanceof Color
		) {
			return this.numeric_array(value.toArray());
		}
		return `ThreeToGl error: unknown value type '${value}'`;
	}
	static numeric_array(values: number[]): string {
		const values_str = new Array(values.length);
		for (let i = 0; i < values.length; i++) {
			values_str[i] = `${CoreString.ensure_float(values[i])}`;
		}
		const gl_type = `vec${values.length}`;
		return `${gl_type}(${values_str.join(', ')})`;
	}
	static vector4(vec: Vector4 | string): string {
		if (CoreType.isString(vec)) {
			return vec;
		}
		const values = vec.toArray().map((v) => {
			return `${CoreString.ensure_float(v)}`;
		});
		return `vec4(${values.join(', ')})`;
	}
	static vector3(vec: Vector3 | string): string {
		if (CoreType.isString(vec)) {
			return vec;
		}
		const values = vec.toArray().map((v) => {
			return `${CoreString.ensure_float(v)}`;
		});
		return `vec3(${values.join(', ')})`;
	}
	static vector2(vec: Vector2 | string): string {
		if (CoreType.isString(vec)) {
			return vec;
		}
		const values = vec.toArray().map((v) => {
			return `${CoreString.ensure_float(v)}`;
		});
		return `vec2(${values.join(', ')})`;
	}

	static vector3_float(vec: Vector3 | string, num: number | string): string {
		if (!CoreType.isString(num)) {
			num = CoreString.ensure_float(num);
		}
		return `vec4(${this.vector3(vec)}, ${num})`;
	}

	static float4(x: number | string, y: number | string, z: number | string, w: number | string) {
		if (!CoreType.isString(x)) {
			x = CoreString.ensure_float(x);
		}
		if (!CoreType.isString(y)) {
			y = CoreString.ensure_float(y);
		}
		if (!CoreType.isString(z)) {
			z = CoreString.ensure_float(z);
		}
		if (!CoreType.isString(w)) {
			w = CoreString.ensure_float(w);
		}
		return `vec4(${x}, ${y}, ${z}, ${w})`;
	}
	static float3(x: number | string, y: number | string, z: number | string) {
		if (!CoreType.isString(x)) {
			x = CoreString.ensure_float(x);
		}
		if (!CoreType.isString(y)) {
			y = CoreString.ensure_float(y);
		}
		if (!CoreType.isString(z)) {
			z = CoreString.ensure_float(z);
		}
		return `vec3(${x}, ${y}, ${z})`;
	}
	static float2(x: number | string, y: number | string) {
		if (!CoreType.isString(x)) {
			x = CoreString.ensure_float(x);
		}
		if (!CoreType.isString(y)) {
			y = CoreString.ensure_float(y);
		}
		return `vec2(${x}, ${y})`;
	}
	static float(x: number | string) {
		if (!CoreType.isString(x)) {
			x = CoreString.ensure_float(x);
		}
		return `${x}`;
	}
	static int(x: number | string) {
		return `${x}`;
	}
	static bool(x: number | string) {
		return `${x}`;
	}
}
