import {Mesh, Object3D, Vector3} from 'three';
import {ObjectNamedFunction1} from './_Base';
import {
	cubeLatticeDeform as _cubeLatticeDeform,
	Vector3_8,
	CubeLatticeDeformOptions,
} from '../../core/geometry/operation/CubeLatticeDeform';

const offset = new Vector3(0, 0, 0);
const options: CubeLatticeDeformOptions = {
	offset,
	moveObjectPosition: false,
};
export class cubeLatticeDeform extends ObjectNamedFunction1<[Vector3_8]> {
	static override type() {
		return 'cubeLatticeDeform';
	}
	func(object3D: Object3D, points: Vector3_8): void {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return;
		}
		_cubeLatticeDeform(object3D, points, options);
	}
}
