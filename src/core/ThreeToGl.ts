import {CoreString} from './String';
import {Color, Matrix3, Matrix4, Vector2, Vector3, Vector4} from 'three';
import {CoreType} from './Type';
import {GlConnectionPointType} from '../engine/nodes/utils/io/connections/Gl';

export const COMPONENTS_BY_GL_TYPE = {
	[GlConnectionPointType.BOOL]: undefined,
	[GlConnectionPointType.INT]: undefined,
	[GlConnectionPointType.FLOAT]: undefined,
	[GlConnectionPointType.VEC2]: ['x', 'y'],
	[GlConnectionPointType.VEC3]: ['x', 'y', 'z'],
	[GlConnectionPointType.VEC4]: ['x', 'y', 'z', 'w'],
	[GlConnectionPointType.MAT3]: undefined,
	[GlConnectionPointType.MAT4]: undefined,
	[GlConnectionPointType.SAMPLER_2D]: undefined,
	[GlConnectionPointType.SAMPLER_2D_ARRAY]: undefined,
	[GlConnectionPointType.SAMPLER_3D]: undefined,
	[GlConnectionPointType.SAMPLER_CUBE]: undefined,
	[GlConnectionPointType.SSS_MODEL]: undefined,
	[GlConnectionPointType.SDF_CONTEXT]: undefined,
	[GlConnectionPointType.SDF_MATERIAL]: undefined,
};
export class ThreeToGl {
	static glType(glType: GlConnectionPointType, value: string) {
		switch (glType) {
			case GlConnectionPointType.BOOL:
				return this.bool(value);
			case GlConnectionPointType.INT:
				return this.integer(value);
			case GlConnectionPointType.FLOAT:
				return this.float(value);
			case GlConnectionPointType.VEC2:
				return this.vector2(value);
			case GlConnectionPointType.VEC3:
				return this.vector3(value);
			case GlConnectionPointType.VEC4:
				return this.vector4(value);
		}
		return `no matching implementation for glType '${glType}' in ThreeToGl.glType`;
		// TypeAssert.unreachable(glType)
	}
	static any(value: any): string {
		if (CoreType.isString(value)) {
			return value;
		}
		if (CoreType.isBoolean(value)) {
			return `${value}`;
		}
		if (CoreType.isNumber(value)) {
			return `${CoreString.ensureFloat(value)}`;
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
			values_str[i] = `${CoreString.ensureFloat(values[i])}`;
		}
		const gl_type = `vec${values.length}`;
		return `${gl_type}(${values_str.join(', ')})`;
	}
	static mat4(vec: Matrix4 | string): string {
		if (CoreType.isString(vec)) {
			return vec;
		}
		const values = vec.toArray().map((v) => {
			return `${CoreString.ensureFloat(v)}`;
		});
		return `mat4(${values.join(', ')})`;
	}
	static mat3(vec: Matrix3 | string): string {
		if (CoreType.isString(vec)) {
			return vec;
		}
		const values = vec.toArray().map((v) => {
			return `${CoreString.ensureFloat(v)}`;
		});
		return `mat3(${values.join(', ')})`;
	}
	static vector4(vec: Vector4 | string): string {
		if (CoreType.isString(vec)) {
			return vec;
		}
		const values = vec.toArray().map((v) => {
			return `${CoreString.ensureFloat(v)}`;
		});
		return `vec4(${values.join(', ')})`;
	}
	static vector3(vec: Vector3 | string): string {
		if (CoreType.isString(vec)) {
			return vec;
		}
		const values = vec.toArray().map((v) => {
			return `${CoreString.ensureFloat(v)}`;
		});
		return `vec3(${values.join(', ')})`;
	}
	static vector2(vec: Vector2 | string): string {
		if (CoreType.isString(vec)) {
			return vec;
		}
		const values = vec.toArray().map((v) => {
			return `${CoreString.ensureFloat(v)}`;
		});
		return `vec2(${values.join(', ')})`;
	}

	static vector3_float(vec: Vector3 | string, num: number | string): string {
		if (CoreType.isNumber(num)) {
			num = CoreString.ensureFloat(num);
		}
		return `vec4(${this.vector3(vec)}, ${num})`;
	}

	static float4(x: number | string, y: number | string, z: number | string, w: number | string) {
		if (CoreType.isNumber(x)) {
			x = CoreString.ensureFloat(x);
		}
		if (CoreType.isNumber(y)) {
			y = CoreString.ensureFloat(y);
		}
		if (CoreType.isNumber(z)) {
			z = CoreString.ensureFloat(z);
		}
		if (CoreType.isNumber(w)) {
			w = CoreString.ensureFloat(w);
		}
		return `vec4(${x}, ${y}, ${z}, ${w})`;
	}
	static float3(x: number | string, y: number | string, z: number | string) {
		if (CoreType.isNumber(x)) {
			x = CoreString.ensureFloat(x);
		}
		if (CoreType.isNumber(y)) {
			y = CoreString.ensureFloat(y);
		}
		if (CoreType.isNumber(z)) {
			z = CoreString.ensureFloat(z);
		}
		return `vec3(${x}, ${y}, ${z})`;
	}
	static float2(x: number | string, y: number | string) {
		if (CoreType.isNumber(x)) {
			x = CoreString.ensureFloat(x);
		}
		if (CoreType.isNumber(y)) {
			y = CoreString.ensureFloat(y);
		}
		return `vec2(${x}, ${y})`;
	}
	static float(x: number | string): string {
		if (CoreType.isNumber(x)) {
			return CoreString.ensureFloat(x);
		} else {
			const converted = parseFloat(x);
			if (CoreType.isNaN(converted)) {
				return x;
			} else {
				return CoreString.ensureFloat(converted);
			}
		}
	}
	static integer(x: number | string): string {
		if (CoreType.isNumber(x)) {
			return CoreString.ensureInteger(x);
		} else {
			const converted = parseInt(x);
			if (CoreType.isNaN(converted)) {
				return x;
			} else {
				return CoreString.ensureInteger(converted);
			}
		}
	}

	static bool(x: boolean | string) {
		if (CoreType.isBoolean(x)) {
			return `${x}`;
		} else {
			return x;
		}
	}
}
