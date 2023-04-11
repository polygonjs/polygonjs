import {Color} from 'three';
import {NamedFunction4} from './_Base';

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
