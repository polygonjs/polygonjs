import {Vector3, Euler, Quaternion, Matrix4} from 'three';
import {CoreMath} from '../../core/math/_Module';
import {NamedFunction2, NamedFunction3, NamedFunction4} from './_Base';
import {vector3Clamp, absV3, maxV3Component} from './_VectorUtils';

const _v3a = new Vector3();
const _v3b = new Vector3();
const _euler = new Euler();
const _quaternion = new Quaternion();
const _s = new Vector3(1, 1, 1);
const _m4 = new Matrix4();
const ROTATION_ORDER = 'XYZ';

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

export class SDFElongateFast extends NamedFunction4<[Vector3, Vector3, Vector3, Vector3]> {
	static override type() {
		return 'SDFElongateFast';
	}
	func(p: Vector3, center: Vector3, h: Vector3, target: Vector3): Vector3 {
		p.sub(center);
		vector3Clamp(p, _v3b.copy(h).multiplyScalar(-1), h, _v3a);
		target.copy(p).sub(_v3a);
		return target;
	}
}

// export function  SDFElongateSlow(  p:Vector3, h:Vector3 )
// {
// 	vec3 q = abs(p)-h;
// 	return vec4( max(q,0.0), min(max(q.x,max(q.y,q.z)),0.0) );
// }
export class SDFElongateSlow extends NamedFunction4<[Vector3, Vector3, Vector3, Vector3]> {
	static override type() {
		return 'SDFElongateSlow';
	}
	func(p: Vector3, center: Vector3, h: Vector3, target: Vector3): Vector3 {
		p.sub(center);
		absV3(p, target).sub(h);
		maxV3Component(target, target, 0);
		return target;
	}
}
export class SDFOnion extends NamedFunction2<[number, number]> {
	static override type() {
		return 'SDFOnion';
	}
	func(sdf: number, thickness: number): number {
		return Math.abs(sdf) - thickness;
	}
}

export class SDFTransform extends NamedFunction4<[Vector3, Vector3, Vector3, Vector3]> {
	static override type() {
		return 'SDFTransform';
	}
	func(p: Vector3, t: Vector3, r: Vector3, target: Vector3): Vector3 {
		_euler.set(r.x, r.y, r.z, ROTATION_ORDER);
		_quaternion.setFromEuler(_euler);
		_m4.compose(t, _quaternion, _s);
		_m4.invert();
		target.copy(p).applyMatrix4(_m4);
		return target;
	}
}
