import {Vector2, Vector3} from 'three';
import {absV2, sizzleVec3XY, sizzleVec3XZ, sizzleVec3YZ} from './sdfUtils';
import {NamedFunction} from '../../code/assemblers/_Base';
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
export const sdRoundedX: NamedFunction = {
	name: 'sdRoundedX',
	func: (p: Vector2, w: number, r: number): number => {
		absV2(p, _q);
		const min = Math.min(_q.x + _q.y, w) * 0.5;
		_q.subScalar(min);
		return _q.length() - r;
	},
};
// float SDFExtrudeX( in vec3 p, in float sdf, in float h )
// {
// 	vec2 w = vec2( sdf, abs(p.x) - h );
// 	return min(max(w.x,w.y),0.0) + length(max(w,0.0));
// }
// float SDFExtrudeY( in vec3 p, in float sdf, in float h )
// {
// 	vec2 w = vec2( sdf, abs(p.y) - h );
// 	return min(max(w.x,w.y),0.0) + length(max(w,0.0));
// }
// float SDFExtrudeZ( in vec3 p, in float sdf, in float h )
// {
// 	vec2 w = vec2( sdf, abs(p.z) - h );
// 	return min(max(w.x,w.y),0.0) + length(max(w,0.0));
// }

const _sizzle2 = new Vector2();
export const SDFRevolutionX: NamedFunction = {
	name: 'SDFRevolutionX',
	func: (p: Vector3, o: number, target: Vector2): void => {
		sizzleVec3YZ.func(p, _sizzle2);
		const l = _sizzle2.length();
		target.x = l - o;
		target.y = p.x;
	},
};
export const SDFRevolutionY: NamedFunction = {
	name: 'SDFRevolutionY',
	func: (p: Vector3, o: number, target: Vector2): void => {
		sizzleVec3XZ.func(p, _sizzle2);
		const l = _sizzle2.length();
		target.x = l - o;
		target.y = p.y;
	},
};
export const SDFRevolutionZ: NamedFunction = {
	name: 'SDFRevolutionZ',
	func: (p: Vector3, o: number, target: Vector2): void => {
		sizzleVec3XY.func(p, _sizzle2);
		const l = _sizzle2.length();
		target.x = l - o;
		target.y = p.z;
	},
};
