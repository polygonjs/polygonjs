import {Vector2} from 'three';
import {absV2, vector2MaxScalar, vector2Dot} from './_VectorUtils';
import {_sizzleVec2} from './_Sizzle';
import {NamedFunction2, NamedFunction3, NamedFunction4, NamedFunction5} from './_Base';

const _q = new Vector2();
const _q2 = new Vector2();
const _b = new Vector2();
const _w = new Vector2();

export class SDF2DBox extends NamedFunction3<[Vector2, Vector2, Vector2]> {
	static override type() {
		return 'SDF2DBox';
	}
	func(p: Vector2, center: Vector2, size: Vector2): number {
		p.sub(center);
		absV2(p, p);
		p.sub(size);
		return vector2MaxScalar(p, 0, _q2).length() + Math.min(Math.max(p.x, p.y), 0.0);
	}
}
export class SDF2DCircle extends NamedFunction3<[Vector2, Vector2, number]> {
	static override type() {
		return 'SDF2DCircle';
	}
	func(p: Vector2, center: Vector2, radius: number): number {
		p.sub(center);
		return p.length() - radius;
	}
}
export class SDF2DCross extends NamedFunction5<[Vector2, Vector2, number, number, number]> {
	static override type() {
		return 'SDF2DCross';
	}
	func(p: Vector2, center: Vector2, length: number, width: number, radius: number): number {
		// p = abs(p)
		p.sub(center);
		absV2(p, p);
		// p = (p.y>p.x) ? p.yx : p.xy;
		if (p.y > p.x) {
			_sizzleVec2(p, _q2);
			p.copy(_q2);
		}
		// vec2  q = p - b;
		_b.x = length;
		_b.y = width;
		_q.copy(p).sub(_b);
		// float k = max(q.y,q.x);
		const k = Math.max(_q.y, _q.x);
		// vec2  w = (k>0.0) ? q : vec2(b.y-p.x,-k);
		if (k > 0) {
			_w.copy(_q);
		} else {
			_w.x = _b.y - p.x;
			_w.y = -k;
		}
		// 	return sign(k)*length(max(w,0.0)) + r;
		return Math.sign(k) * vector2MaxScalar(_w, 0, _w).length() + radius;
	}
}

// float sdHeart( in vec2 p )
// {
// 	p.x = abs(p.x);

// 	if( p.y+p.x>1.0 )
// 		return sqrt(dot2(p-vec2(0.25,0.75))) - sqrt(2.0)/4.0;
// 	return sqrt(min(dot2(p-vec2(0.00,1.00)),
// 					dot2(p-0.5*max(p.x+p.y,0.0)))) * sign(p.x-p.y);
// }
const SQRT_2_BY_4 = Math.sqrt(2.0) / 4.0;
export class SDF2DHeart extends NamedFunction2<[Vector2, Vector2]> {
	static override type() {
		return 'SDF2DHeart';
	}
	func(p: Vector2, center: Vector2): number {
		p.sub(center);
		// p.x = abs(p.x)
		p.x = Math.abs(p.x);
		if (p.y + p.x > 1.0) {
			_q2.set(0.25, 0.75);
			// return sqrt(dot2(p-vec2(0.25,0.75))) - sqrt(2.0)/4.0;
			return Math.sqrt(vector2Dot(p.sub(_q2))) - SQRT_2_BY_4;
		}
		// return sqrt(min(dot2(p-vec2(0.00,1.00)),
		// 					dot2(p-0.5*max(p.x+p.y,0.0)))) * sign(p.x-p.y);
		_q2.set(0.25, 0.75);
		const a = vector2Dot(p.sub(_q2));
		const b = vector2Dot(p.subScalar(0.5 * Math.max(p.x + p.y, 0.0)));
		const c = Math.sqrt(Math.min(a, b));
		const d = Math.sign(p.x - p.y);
		return c * d;
	}
}

export class SDF2DRoundedX extends NamedFunction4<[Vector2, Vector2, number, number]> {
	static override type() {
		return 'SDF2DRoundedX';
	}
	func(p: Vector2, center: Vector2, w: number, r: number): number {
		p.sub(center);
		absV2(p, _q);
		const min = Math.min(_q.x + _q.y, w) * 0.5;
		_q.subScalar(min);
		return _q.length() - r;
	}
}
