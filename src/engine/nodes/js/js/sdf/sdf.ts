import {Vector3} from 'three';
import {CoreMath} from '../../../../../core/math/_Module';
import {NamedFunction} from '../../code/assemblers/_Base';
import {absV3, maxV3Components, maxV3Component} from './sdfUtils';

const _q = new Vector3();
const _sHalf = new Vector3();

//
//
// SDF PRIMITIVES
//
//
export const sdSphere: NamedFunction = {
	name: 'sdSphere',
	func: (p: Vector3, s: number): number => {
		return p.length() - s;
	},
};
export const sdBox: NamedFunction = {
	name: 'sdBox',
	func: (p: Vector3, s: Vector3): number => {
		_sHalf.copy(s).multiplyScalar(0.5);
		absV3(p, _q);
		_q.sub(_sHalf);

		const max = Math.min(0, maxV3Components(_q));
		maxV3Component(_q, _q, 0);
		const length = _q.length();

		return length + max;
	},
};

/*
 *
 * SDF OPERATIONS
 *
 */
export const SDFUnion: NamedFunction = {
	name: 'SDFUnion',
	func: (d1: number, d2: number): number => {
		return Math.min(d1, d2);
	},
};
export const SDFSubtract: NamedFunction = {
	name: 'SDFSubtract',
	func: (d1: number, d2: number): number => {
		return Math.max(-d1, d2);
	},
};
export const SDFIntersect: NamedFunction = {
	name: 'SDFIntersect',
	func: (d1: number, d2: number): number => {
		return Math.max(d1, d2);
	},
};

export const SDFSmoothUnion: NamedFunction = {
	name: 'SDFSmoothUnion',
	func: (d1: number, d2: number, k: number): number => {
		const h = CoreMath.clamp(0.5 + (0.5 * (d2 - d1)) / k, 0.0, 1.0);
		return CoreMath.mix(d2, d1, h) - k * h * (1.0 - h);
	},
};

export const SDFSmoothSubtract: NamedFunction = {
	name: 'SDFSmoothSubtract',
	func: (d1: number, d2: number, k: number): number => {
		const h = CoreMath.clamp(0.5 - (0.5 * (d2 + d1)) / k, 0.0, 1.0);
		return CoreMath.mix(d2, -d1, h) + k * h * (1.0 - h);
	},
};

export const SDFSmoothIntersect: NamedFunction = {
	name: 'SDFSmoothIntersect',
	func: (d1: number, d2: number, k: number): number => {
		const h = CoreMath.clamp(0.5 - (0.5 * (d2 - d1)) / k, 0.0, 1.0);
		return CoreMath.mix(d2, d1, h) + k * h * (1.0 - h);
	},
};

// export function  SDFElongateFast( p:Vector3, h:Vector3 )
// {
// 	return vec4( p-CoreMath.clamp(p,-h,h), 0.0 );
// }
// export function  SDFElongateSlow(  p:Vector3, h:Vector3 )
// {
// 	vec3 q = abs(p)-h;
// 	return vec4( max(q,0.0), min(max(q.x,max(q.y,q.z)),0.0) );
// }

export function SDFOnion(sdf: number, thickness: number) {
	return Math.abs(sdf) - thickness;
}
