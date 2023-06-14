import {Number3} from '../../types/GlobalTypes';

type AllowedArray = Float32Array | Number3 | number[];

export function vecSetZero(a: AllowedArray, anr: number) {
	anr *= 3;
	a[anr++] = 0.0;
	a[anr++] = 0.0;
	a[anr] = 0.0;
}

export function vecScale(a: AllowedArray, anr: number, scale: number) {
	anr *= 3;
	a[anr++] *= scale;
	a[anr++] *= scale;
	a[anr] *= scale;
}

export function vecCopy(a: AllowedArray, anr: number, b: AllowedArray, bnr: number) {
	anr *= 3;
	bnr *= 3;
	a[anr++] = b[bnr++];
	a[anr++] = b[bnr++];
	a[anr] = b[bnr];
}

export function vecAdd(a: AllowedArray, anr: number, b: AllowedArray, bnr: number, scale = 1.0) {
	anr *= 3;
	bnr *= 3;
	a[anr++] += b[bnr++] * scale;
	a[anr++] += b[bnr++] * scale;
	a[anr] += b[bnr] * scale;
}

export function vecSetDiff(
	dst: AllowedArray,
	dnr: number,
	a: AllowedArray,
	anr: number,
	b: AllowedArray,
	bnr: number,
	scale = 1.0
) {
	dnr *= 3;
	anr *= 3;
	bnr *= 3;
	dst[dnr++] = (a[anr++] - b[bnr++]) * scale;
	dst[dnr++] = (a[anr++] - b[bnr++]) * scale;
	dst[dnr] = (a[anr] - b[bnr]) * scale;
}

export function vecLengthSquared(a: AllowedArray, anr: number) {
	anr *= 3;
	let a0 = a[anr],
		a1 = a[anr + 1],
		a2 = a[anr + 2];
	return a0 * a0 + a1 * a1 + a2 * a2;
}

export function vecDistSquared(a: AllowedArray, anr: number, b: AllowedArray, bnr: number) {
	anr *= 3;
	bnr *= 3;
	let a0 = a[anr] - b[bnr],
		a1 = a[anr + 1] - b[bnr + 1],
		a2 = a[anr + 2] - b[bnr + 2];
	return a0 * a0 + a1 * a1 + a2 * a2;
}

export function vecDot(a: AllowedArray, anr: number, b: AllowedArray, bnr: number) {
	anr *= 3;
	bnr *= 3;
	return a[anr] * b[bnr] + a[anr + 1] * b[bnr + 1] + a[anr + 2] * b[bnr + 2];
}

export function vecSetCross(a: AllowedArray, anr: number, b: AllowedArray, bnr: number, c: AllowedArray, cnr: number) {
	anr *= 3;
	bnr *= 3;
	cnr *= 3;
	a[anr++] = b[bnr + 1] * c[cnr + 2] - b[bnr + 2] * c[cnr + 1];
	a[anr++] = b[bnr + 2] * c[cnr + 0] - b[bnr + 0] * c[cnr + 2];
	a[anr] = b[bnr + 0] * c[cnr + 1] - b[bnr + 1] * c[cnr + 0];
}
