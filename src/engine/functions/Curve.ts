import {CatmullRomCurve3, Vector3} from 'three';
import {NamedFunction3} from './_Base';

export class catmullRomCurve3GetPoint extends NamedFunction3<[CatmullRomCurve3, number, Vector3]> {
	static override type() {
		return 'catmullRomCurve3GetPoint';
	}
	func(curve: CatmullRomCurve3, t: number, target: Vector3): Vector3 {
		curve.getPoint(t, target);
		return target;
	}
}
