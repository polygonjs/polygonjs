import {Vector2, Vector3, Vector4} from 'three';
import {NamedFunction8} from './_Base';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {randFloat} from '../../core/math/_Module';

const _v2 = new Vector2();
const _v3 = new Vector3();
const _v4 = new Vector4();

const _simplexBySeed: Map<number, SimplexNoise> = new Map();
function _getOrCreateSimplex(seed: number): SimplexNoise {
	let simplex = _simplexBySeed.get(seed);
	if (!simplex) {
		const random_generator = {
			random: function () {
				return randFloat(seed);
			},
		};
		simplex = new SimplexNoise(random_generator);
		_simplexBySeed.set(seed, simplex);
	}
	return simplex;
}
function _fbm2d(
	simplex: SimplexNoise,
	x: number,
	y: number,
	octaves: number,
	ampMult: number,
	freqMult: number
): number {
	let value = 0.0;
	let amplitude = 1.0;
	for (let i = 0; i < octaves; i++) {
		value += amplitude * simplex.noise(x, y);
		x *= freqMult;
		y *= freqMult;
		amplitude *= ampMult;
	}
	return value;
}
function _fbm3d(
	simplex: SimplexNoise,
	x: number,
	y: number,
	z: number,
	octaves: number,
	ampMult: number,
	freqMult: number
): number {
	let value = 0.0;
	let amplitude = 1.0;
	for (let i = 0; i < octaves; i++) {
		value += amplitude * simplex.noise3d(x, y, z);
		x *= freqMult;
		y *= freqMult;
		z *= freqMult;
		amplitude *= ampMult;
	}
	return value;
}
function _fbm4d(
	simplex: SimplexNoise,
	x: number,
	y: number,
	z: number,
	w: number,
	octaves: number,
	ampMult: number,
	freqMult: number
): number {
	let value = 0.0;
	let amplitude = 1.0;
	for (let i = 0; i < octaves; i++) {
		value += amplitude * simplex.noise4d(x, y, z, w);
		x *= freqMult;
		y *= freqMult;
		z *= freqMult;
		w *= freqMult;
		amplitude *= ampMult;
	}
	return value;
}

export class noiseSimplexVector2 extends NamedFunction8<
	[Vector2, number, Vector2, Vector2, number, number, number, number]
> {
	static override type() {
		return 'noiseSimplexVector2';
	}
	func(
		position: Vector2,
		amp: number,
		freq: Vector2,
		offset: Vector2,
		octaves: number,
		ampMult: number,
		freqMult: number,
		seed: number
	): number {
		const simplex = _getOrCreateSimplex(seed);
		_v2.copy(position).add(offset).multiply(freq);
		return amp * _fbm2d(simplex, _v2.x, _v2.y, octaves, ampMult, freqMult);
	}
}

export class noiseSimplexVector3 extends NamedFunction8<
	[Vector3, number, Vector3, Vector3, number, number, number, number]
> {
	static override type() {
		return 'noiseSimplexVector3';
	}
	func(
		position: Vector3,
		amp: number,
		freq: Vector3,
		offset: Vector3,
		octaves: number,
		ampMult: number,
		freqMult: number,
		seed: number
	): number {
		const simplex = _getOrCreateSimplex(seed);
		_v3.copy(position).add(offset).multiply(freq);
		return amp * _fbm3d(simplex, _v3.x, _v3.y, _v3.z, octaves, ampMult, freqMult);
	}
}
export class noiseSimplexVector4 extends NamedFunction8<
	[Vector4, number, Vector4, Vector4, number, number, number, number]
> {
	static override type() {
		return 'noiseSimplexVector4';
	}
	func(
		position: Vector4,
		amp: number,
		freq: Vector4,
		offset: Vector4,
		octaves: number,
		ampMult: number,
		freqMult: number,
		seed: number
	): number {
		const simplex = _getOrCreateSimplex(seed);
		_v4.copy(position).add(offset).multiply(freq);
		return amp * _fbm4d(simplex, _v4.x, _v4.y, _v4.z, _v4.w, octaves, ampMult, freqMult);
	}
}
