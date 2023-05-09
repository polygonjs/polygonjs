import {CoreMath} from '../../core/math/_Module';
import {NamedFunction2, NamedFunction3} from './_Base';

/*
 *
 * SDF OPERATIONS
 *
 */
export class SDFUnion extends NamedFunction2<[number, number]> {
	static override type() {
		return 'SDFUnion';
	}
	func(d1: number, d2: number): number {
		return Math.min(d1, d2);
	}
}
export class SDFSubtract extends NamedFunction2<[number, number]> {
	static override type() {
		return 'SDFSubtract';
	}
	func(d1: number, d2: number): number {
		return Math.max(-d1, d2);
	}
}
export class SDFIntersect extends NamedFunction2<[number, number]> {
	static override type() {
		return 'SDFIntersect';
	}
	func(d1: number, d2: number): number {
		return Math.max(d1, d2);
	}
}

export class SDFSmoothUnion extends NamedFunction3<[number, number, number]> {
	static override type() {
		return 'SDFSmoothUnion';
	}
	func(d1: number, d2: number, k: number): number {
		const h = CoreMath.clamp(0.5 + (0.5 * (d2 - d1)) / k, 0.0, 1.0);
		return CoreMath.mix(d2, d1, h) - k * h * (1.0 - h);
	}
}

export class SDFSmoothSubtract extends NamedFunction3<[number, number, number]> {
	static override type() {
		return 'SDFSmoothSubtract';
	}
	func(d1: number, d2: number, k: number): number {
		const h = CoreMath.clamp(0.5 - (0.5 * (d2 + d1)) / k, 0.0, 1.0);
		return CoreMath.mix(d2, -d1, h) + k * h * (1.0 - h);
	}
}

export class SDFSmoothIntersect extends NamedFunction3<[number, number, number]> {
	static override type() {
		return 'SDFSmoothIntersect';
	}
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
