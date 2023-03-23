import {Vector3} from 'three';
import {CoreMath} from '../../../../../core/math/_Module';
import {NamedFunction2, NamedFunction3, NamedFunction4} from '../../code/assemblers/NamedFunction';
import {absV3, maxV3Components, maxV3Component} from '../conversion';

const _q = new Vector3();
const _sHalf = new Vector3();

//
//
// SDF PRIMITIVES
//
//
export class sdSphere extends NamedFunction3<[Vector3, Vector3, number]> {
	type = 'sdSphere';
	func(p: Vector3, center: Vector3, s: number): number {
		return p.sub(center).length() - s;
	}
}
export class sdBox extends NamedFunction4<[Vector3, Vector3, Vector3, number]> {
	type = 'sdBox';
	func(p: Vector3, center: Vector3, sizes: Vector3, size: number): number {
		_sHalf.copy(sizes).multiplyScalar(size * 0.5);
		absV3(p.sub(center), _q);
		_q.sub(_sHalf);

		const max = Math.min(0, maxV3Components(_q));
		maxV3Component(_q, _q, 0);
		const length = _q.length();

		return length + max;
	}
}

/*
 *
 * SDF OPERATIONS
 *
 */
export class SDFUnion extends NamedFunction2<[number, number]> {
	type = 'SDFUnion';
	func(d1: number, d2: number): number {
		return Math.min(d1, d2);
	}
}
export class SDFSubtract extends NamedFunction2<[number, number]> {
	type = 'SDFSubtract';
	func(d1: number, d2: number): number {
		return Math.max(-d1, d2);
	}
}
export class SDFIntersect extends NamedFunction2<[number, number]> {
	type = 'SDFIntersect';
	func(d1: number, d2: number): number {
		return Math.max(d1, d2);
	}
}

export class SDFSmoothUnion extends NamedFunction3<[number, number, number]> {
	type = 'SDFSmoothUnion';
	func(d1: number, d2: number, k: number): number {
		const h = CoreMath.clamp(0.5 + (0.5 * (d2 - d1)) / k, 0.0, 1.0);
		return CoreMath.mix(d2, d1, h) - k * h * (1.0 - h);
	}
}

export class SDFSmoothSubtract extends NamedFunction3<[number, number, number]> {
	type = 'SDFSmoothSubtract';
	func(d1: number, d2: number, k: number): number {
		const h = CoreMath.clamp(0.5 - (0.5 * (d2 + d1)) / k, 0.0, 1.0);
		return CoreMath.mix(d2, -d1, h) + k * h * (1.0 - h);
	}
}

export class SDFSmoothIntersect extends NamedFunction3<[number, number, number]> {
	type = 'SDFSmoothIntersect';
	func(d1: number, d2: number, k: number): number {
		const h = CoreMath.clamp(0.5 - (0.5 * (d2 - d1)) / k, 0.0, 1.0);
		return CoreMath.mix(d2, d1, h) + k * h * (1.0 - h);
	}
}

// export function  SDFElongateFast( p:Vector3, h:Vector3 )
// {
// 	return vec4( p-CoreMath.clamp(p,-h,h), 0.0 );
// }
// export function  SDFElongateSlow(  p:Vector3, h:Vector3 )
// {
// 	vec3 q = abs(p)-h;
// 	return vec4( max(q,0.0), min(max(q.x,max(q.y,q.z)),0.0) );
// }

// export function SDFOnion(sdf: number, thickness: number) {
// 	return Math.abs(sdf) - thickness;
// }
