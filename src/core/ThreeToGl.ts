import {CoreString} from './String';
import {Vector3} from 'three/src/math/Vector3';
import {Vector2} from 'three/src/math/Vector2';
import lodash_isNumber from 'lodash/isNumber';
import lodash_isBoolean from 'lodash/isBoolean';
import lodash_isString from 'lodash/isString';

export class ThreeToGl {
	static any(value: any) {
		if (lodash_isString(value)) {
			return value;
		}
		if (lodash_isBoolean(value)) {
			return `${value}`;
		}

		if (lodash_isNumber(value)) {
			return `${CoreString.ensure_float(value)}`;
		} else {
			const values = value.toArray().map((v: number) => {
				return `${CoreString.ensure_float(v)}`;
			});
			const gl_type = `vec${values.length}`;
			return `${gl_type}(${values.join(', ')})`;
		}
	}

	static vector3(vec: Vector3 | string): string {
		if (lodash_isString(vec)) {
			return vec;
		}
		const values = vec.toArray().map((v) => {
			return `${CoreString.ensure_float(v)}`;
		});
		return `vec3(${values.join(', ')})`;
	}
	static vector2(vec: Vector2 | string): string {
		if (lodash_isString(vec)) {
			return vec;
		}
		const values = vec.toArray().map((v) => {
			return `${CoreString.ensure_float(v)}`;
		});
		return `vec2(${values.join(', ')})`;
	}

	static vector3_float(vec: Vector3 | string, num: number | string): string {
		if (!lodash_isString(num)) {
			num = CoreString.ensure_float(num);
		}
		return `vec4(${this.vector3(vec)}, ${num})`;
	}

	static float4(x: number | string, y: number | string, z: number | string, w: number | string) {
		if (!lodash_isString(x)) {
			x = CoreString.ensure_float(x);
		}
		if (!lodash_isString(y)) {
			y = CoreString.ensure_float(y);
		}
		if (!lodash_isString(z)) {
			z = CoreString.ensure_float(z);
		}
		if (!lodash_isString(w)) {
			w = CoreString.ensure_float(w);
		}
		return `vec4(${x}, ${y}, ${z}, ${w})`;
	}
	static float3(x: number | string, y: number | string, z: number | string) {
		if (!lodash_isString(x)) {
			x = CoreString.ensure_float(x);
		}
		if (!lodash_isString(y)) {
			y = CoreString.ensure_float(y);
		}
		if (!lodash_isString(z)) {
			z = CoreString.ensure_float(z);
		}
		return `vec3(${x}, ${y}, ${z})`;
	}
	static float2(x: number | string, y: number | string) {
		if (!lodash_isString(x)) {
			x = CoreString.ensure_float(x);
		}
		if (!lodash_isString(y)) {
			y = CoreString.ensure_float(y);
		}
		return `vec2(${x}, ${y})`;
	}
	static float(x: number | string) {
		if (!lodash_isString(x)) {
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
