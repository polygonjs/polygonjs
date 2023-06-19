import {LngLatLike, Vector2Like} from '../../types/GlobalTypes';
import {Vector3, Triangle, MathUtils} from 'three';
import {Easing} from './Easing';
import {CoreType} from '../Type';

const RAND_A = 12.9898;
const RAND_B = 78.233;
const RAND_C = 43758.5453;

export const degToRad = MathUtils.degToRad;
export const radToDeg = MathUtils.radToDeg;

export function clamp(val: number, min: number, max: number): number {
	if (val < min) {
		return min;
	} else if (val > max) {
		return max;
	} else {
		return val;
	}
}
export const smoothstep = MathUtils.smoothstep;
export const smootherstep = MathUtils.smootherstep;
export function fit(val: number, srcMin: number, srcMax: number, destMin: number, destMax: number): number {
	const src_range = srcMax - srcMin;
	const dest_range = destMax - destMin;

	const r = (val - srcMin) / src_range;
	return r * dest_range + destMin;
}
export function fit01(val: number, destMin: number, destMax: number): number {
	// const size = max - min;
	// return (val - min) / size;
	return fit(val, 0, 1, destMin, destMax);
}
export function fitClamp(val: number, srcMin: number, srcMax: number, destMin: number, destMax: number): number {
	const r = fit(val, srcMin, srcMax, destMin, destMax);
	return clamp(r, destMin, destMax);
}
export function mix(num0: number, num1: number, blend: number) {
	return (1 - blend) * num0 + blend * num1;
}
export const fract = (number: number) => number - Math.floor(number);
const DEFAULT_Y = 136574;
const _vec = {x: 0, y: DEFAULT_Y};
export function randFloat(x: number, y: number = DEFAULT_Y): number {
	_vec.x = x;
	_vec.y = y;
	return randVec2(_vec);
}

export function randVec2(uv: Vector2Like) {
	const dt = uv.x * RAND_A + uv.y * RAND_B; //dot( uv.xy, vec2( a,b ) )
	const sn = dt % Math.PI;
	return fract(Math.sin(sn) * RAND_C);
}
export function rand(number: number | Vector2Like): number {
	if (CoreType.isNumber(number)) {
		return randFloat(number);
	} else {
		return randVec2(number);
	}
}
export function round(number: number, stepSize: number): number {
	const stepsCount = number / stepSize;
	const roundedStepsCount = number < 0 ? Math.ceil(stepsCount) : Math.floor(stepsCount);
	return roundedStepsCount * stepSize;
}
export function mod(number: number, _mod: number) {
	return ((number % _mod) + _mod) % _mod;
}
export function highestEven(number: number): number {
	return 2 * Math.ceil(number * 0.5);
}
export function nearestPower2(num: number) {
	return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
}
export function pow2Inverse(num: number) {
	return Math.log(num) / Math.log(2);
}
// https://www.movable-type.co.uk/scripts/latlong.html
export function geodesicDistance(lnglat1: LngLatLike, lnglat2: LngLatLike): number {
	var R = 6371e3; // metres
	var d1 = degToRad(lnglat1.lat);
	var d2 = degToRad(lnglat2.lat);
	var ad1 = degToRad(lnglat2.lat - lnglat1.lat);
	var ad2 = degToRad(lnglat2.lng - lnglat1.lng);

	var a = Math.sin(ad1 / 2) * Math.sin(ad1 / 2) + Math.cos(d1) * Math.cos(d2) * Math.sin(ad2 / 2) * Math.sin(ad2 / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	var d = R * c;
	return d;
}
const _triangleMid = new Vector3();
const _triangleMidToCorner = new Vector3();
export function expandTriangle(triangle: Triangle, margin: number) {
	triangle.getMidpoint(_triangleMid);

	// a
	_triangleMidToCorner.copy(triangle.a).sub(_triangleMid);
	_triangleMidToCorner.normalize().multiplyScalar(margin);
	triangle.a.add(_triangleMidToCorner);
	// b
	_triangleMidToCorner.copy(triangle.b).sub(_triangleMid);
	_triangleMidToCorner.normalize().multiplyScalar(margin);
	triangle.b.add(_triangleMidToCorner);
	// c
	_triangleMidToCorner.copy(triangle.c).sub(_triangleMid);
	_triangleMidToCorner.normalize().multiplyScalar(margin);
	triangle.c.add(_triangleMidToCorner);
}
export class CoreMath {
	static Easing = Easing; // used in expressions
	static degToRad = degToRad; // used in expressions
	static radToDeg = radToDeg; // used in expressions
	static clamp = clamp; // used in expressions
	static smoothstep = smoothstep;
	static smootherstep = smootherstep;
	static fit01 = fit01; // used in expressions
	static fit = fit; // used in expressions
	static fitClamp = fitClamp; // used in expressions
	static mix = mix; // used in expressions
	static fract = fract; // used in expressions
	static rand = rand; // from threejs glsl rand
	static round = round;

	static highestEven = highestEven;
	static nearestPower2 = nearestPower2;
	static pow2Inverse = pow2Inverse;

	static randFloat = randFloat;
	static randVec2 = randVec2;
}
