import {Vector3} from 'three/src/math/Vector3';
import {Triangle} from 'three/src/math/Triangle';
const THREE = {Triangle, Vector3};
import lodash_isNumber from 'lodash/isNumber';
// import {Octree} from './Octree'
// import Interpolate from './Interpolate'
import {Easing} from './Easing';

const RAD_DEG_RATIO = Math.PI / 180;

export class CoreMath {
	// static Octree = Octree
	// static Interpolate = Interpolate
	static Easing = Easing; // used in expressins

	static clamp(val: number, min: number, max: number): number {
		if (val < min) {
			return min;
		} else if (val > max) {
			return max;
		} else {
			return val;
		}
	}

	static fit01(val: number, dest_min: number, dest_max: number): number {
		// const size = max - min;
		// return (val - min) / size;
		return this.fit(val, 0, 1, dest_min, dest_max);
	}

	static fit(val: number, src_min: number, src_max: number, dest_min: number, dest_max: number): number {
		const src_range = src_max - src_min;
		const dest_range = dest_max - dest_min;

		const r = (val - src_min) / src_range;
		return r * dest_range + dest_min;
	}

	static degrees_to_radians(degrees: number): number {
		return degrees * RAD_DEG_RATIO;
	}
	static radians_to_degrees(radians: number): number {
		return radians / RAD_DEG_RATIO;
	}
	static deg2rad(deg: number): number {
		return this.degrees_to_radians(deg);
	}
	static rad2deg(rad: number): number {
		return this.radians_to_degrees(rad);
	}

	static fract = (number: number) => number - Math.floor(number);

	// from threejs glsl rand
	static rand(number: number): number {
		if (lodash_isNumber(number)) {
			return this.rand_float(number);
		} else {
			return this.rand_vec2(number);
		}
	}

	static round(number: number, step_size: number): number {
		const steps_count = number / step_size;
		const rounded_steps_count = number < 0 ? Math.ceil(steps_count) : Math.floor(steps_count);
		console.log('round', step_size, number, steps_count, rounded_steps_count, rounded_steps_count * step_size);
		return rounded_steps_count * step_size;
	}

	static highest_even(number: number): number {
		return 2 * Math.ceil(number * 0.5);
	}

	static rand_float(number: number): number {
		const vec = {
			x: number,
			y: 136574,
		};
		return this.rand_vec2(vec);
	}

	static rand_vec2(uv: Vector2Like) {
		const a = 12.9898;
		const b = 78.233;
		const c = 43758.5453;
		const dt = uv.x * a + uv.y * b; //dot( uv.xy, vec2( a,b ) )
		const sn = dt % Math.PI;
		return this.fract(Math.sin(sn) * c);
	}

	// https://www.movable-type.co.uk/scripts/latlong.html
	static geodesic_distance(lnglat1: LngLatLike, lnglat2: LngLatLike): number {
		var R = 6371e3; // metres
		var φ1 = this.deg2rad(lnglat1.lat);
		var φ2 = this.deg2rad(lnglat2.lat);
		var Δφ = this.deg2rad(lnglat2.lat - lnglat1.lat);
		var Δλ = this.deg2rad(lnglat2.lng - lnglat1.lng);

		var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		var d = R * c;
		return d;
	}

	static expand_triangle(triangle: Triangle, margin: number): Triangle {
		const mid_point = new THREE.Vector3();
		triangle.getMidpoint(mid_point);

		enum TriangleProp {
			a = 'a',
			b = 'b',
			c = 'c',
		}
		for (let prop of ['a', 'b', 'c']) {
			const delta = triangle[prop as TriangleProp].clone().sub(mid_point);
			const delta_n = delta.clone().normalize();
			const length = delta.length() + margin;

			triangle[prop as TriangleProp] = mid_point.clone().add(delta_n.multiplyScalar(length));
		}
		return triangle;
	}

	static nearestPower2(num: number) {
		return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
	}
}
