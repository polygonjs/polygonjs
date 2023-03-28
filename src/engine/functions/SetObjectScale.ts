import {Object3D, Vector3} from 'three';
import {ObjectNamedFunction4} from './_Base';

const _scale = new Vector3();
export class setObjectScale extends ObjectNamedFunction4<[Vector3, number, number, boolean]> {
	static override type() {
		return 'setObjectScale';
	}
	func(object3D: Object3D, scale: Vector3, mult: number, lerp: number, updateMatrix: boolean): void {
		if (lerp >= 1) {
			object3D.scale.copy(scale).multiplyScalar(mult);
		} else {
			_scale.copy(scale).multiplyScalar(mult);
			object3D.scale.lerp(_scale, lerp);
		}
		if (updateMatrix) {
			object3D.updateMatrix();
		}
	}
}
