import {Vector2} from 'three';
import {absV2, _sizzleVec3XY, _sizzleVec3XZ, _sizzleVec3YZ} from './conversion';
import {NamedFunction4} from './_Base';
// float sdBox( in vec2 p, in vec2 b )
// {
// 	vec2 d = abs(p)-b;
// 	return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
// }
// float sdCircle( vec2 p, float r )
// {
// 	return length(p) - r;
// }
// float sdHeart( in vec2 p )
// {
// 	p.x = abs(p.x);

// 	if( p.y+p.x>1.0 )
// 		return sqrt(dot2(p-vec2(0.25,0.75))) - sqrt(2.0)/4.0;
// 	return sqrt(min(dot2(p-vec2(0.00,1.00)),
// 					dot2(p-0.5*max(p.x+p.y,0.0)))) * sign(p.x-p.y);
// }
// float sdCross( in vec2 p, in vec2 b, float r )
// {
// 	p = abs(p); p = (p.y>p.x) ? p.yx : p.xy;
// 	vec2  q = p - b;
// 	float k = max(q.y,q.x);
// 	vec2  w = (k>0.0) ? q : vec2(b.y-p.x,-k);
// 	return sign(k)*length(max(w,0.0)) + r;
// }
const _q = new Vector2();
export class SDFRoundedX extends NamedFunction4<[Vector2, Vector2, number, number]> {
	static override type() {
		return 'SDFRoundedX';
	}
	func(p: Vector2, center: Vector2, w: number, r: number): number {
		p.sub(center);
		absV2(p, _q);
		const min = Math.min(_q.x + _q.y, w) * 0.5;
		_q.subScalar(min);
		return _q.length() - r;
	}
}