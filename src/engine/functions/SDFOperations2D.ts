import {Vector2, Vector3} from 'three';
import {_sizzleVec3XY, _sizzleVec3XZ, _sizzleVec3YZ} from './conversion';
import {NamedFunction4} from './_Base';

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
export class SDFRevolutionX extends NamedFunction4<[Vector3, Vector3, number, Vector2]> {
	static override type() {
		return 'SDFRevolutionX';
	}
	func(p: Vector3, center: Vector3, o: number, target: Vector2): void {
		p.sub(center);
		_sizzleVec3YZ(p, _sizzle2);
		const l = _sizzle2.length();
		target.x = l - o;
		target.y = p.x;
	}
}
export class SDFRevolutionY extends NamedFunction4<[Vector3, Vector3, number, Vector2]> {
	static override type() {
		return 'SDFRevolutionY';
	}
	func(p: Vector3, center: Vector3, o: number, target: Vector2): void {
		p.sub(center);
		_sizzleVec3XZ(p, _sizzle2);
		const l = _sizzle2.length();
		target.x = l - o;
		target.y = p.y;
	}
}
export class SDFRevolutionZ extends NamedFunction4<[Vector3, Vector3, number, Vector2]> {
	static override type() {
		return 'SDFRevolutionZ';
	}
	func(p: Vector3, center: Vector3, o: number, target: Vector2): void {
		p.sub(center);
		_sizzleVec3XY(p, _sizzle2);
		const l = _sizzle2.length();
		target.x = l - o;
		target.y = p.z;
	}
}
