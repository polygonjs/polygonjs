import {Vector3} from 'three';
import {NamedFunction7} from './_Base';
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise';

const _v3 = new Vector3();

const noise = new ImprovedNoise();

function _fbm3d(x: number, y: number, z: number, octaves: number, ampMult: number, freqMult: number): number {
	let value = 0.0;
	let amplitude = 1.0;
	for (let i = 0; i < octaves; i++) {
		value += amplitude * noise.noise(x, y, z);
		x *= freqMult;
		y *= freqMult;
		z *= freqMult;
		amplitude *= ampMult;
	}
	return value;
}

export class noiseImprovedVector3 extends NamedFunction7<[Vector3, number, Vector3, Vector3, number, number, number]> {
	static override type() {
		return 'noiseImprovedVector3';
	}
	func(
		position: Vector3,
		amp: number,
		freq: Vector3,
		offset: Vector3,
		octaves: number,
		ampMult: number,
		freqMult: number
	): number {
		_v3.copy(position).add(offset).multiply(freq);
		return amp * _fbm3d(_v3.x, _v3.y, _v3.z, octaves, ampMult, freqMult);
	}
}
