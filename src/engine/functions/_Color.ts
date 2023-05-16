import {Vector3, Color} from 'three';
import {NamedFunction2, NamedFunction4} from './_Base';

// https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately#17243070
function _hsvToRgb(h: number, s: number, v: number, target: Color): void {
	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0:
			(target.r = v), (target.g = t), (target.b = p);
			break;
		case 1:
			(target.r = q), (target.g = v), (target.b = p);
			break;
		case 2:
			(target.r = p), (target.g = v), (target.b = t);
			break;
		case 3:
			(target.r = p), (target.g = q), (target.b = v);
			break;
		case 4:
			(target.r = t), (target.g = p), (target.b = v);
			break;
		case 5:
			(target.r = v), (target.g = p), (target.b = q);
			break;
	}
}
export class colorSetRGB extends NamedFunction4<[Color, number, number, number]> {
	static override type() {
		return 'colorSetRGB';
	}
	func(color: Color, r: number, g: number, b: number): Color {
		color.r = r;
		color.g = g;
		color.b = b;
		return color;
	}
}

export class hsvToRgb extends NamedFunction2<[Vector3, Color]> {
	static override type() {
		return 'hsvToRgb';
	}
	func(hsv: Vector3, target: Color): Color {
		_hsvToRgb(hsv.x, hsv.y, hsv.z, target);
		return target;
	}
}
