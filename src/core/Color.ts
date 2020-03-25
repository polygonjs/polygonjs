import {MathUtils} from 'three/src/math/MathUtils';
import {Color} from 'three/src/math/Color';

export class CoreColor {
	// use color.toStyle() if needed
	// static to_css(color: Color): string {
	// 	const color_elements = color.toArray().map((e) => e * 255)
	// 	return `rgb(${color_elements.join(', ')})`
	// }

	// from THREE.js examples ColorConverter.js
	static set_hsv(h: number, s: number, v: number, target: Color) {
		h = MathUtils.euclideanModulo(h, 1);
		s = MathUtils.clamp(s, 0, 1);
		v = MathUtils.clamp(v, 0, 1);

		target.setHSL(h, (s * v) / ((h = (2 - s) * v) < 1 ? h : 2 - h), h * 0.5);
	}
}
