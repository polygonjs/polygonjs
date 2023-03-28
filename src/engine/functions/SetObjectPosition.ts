import {Object3D, Vector3} from 'three';
import {ObjectNamedFunction3} from './_Base';

export class setObjectPosition extends ObjectNamedFunction3<[Vector3, number, boolean]> {
	static override type() {
		return 'setObjectPosition';
	}
	func(object3D: Object3D, position: Vector3, lerp: number, updateMatrix: boolean): void {
		console.log(object3D, object3D.position.toArray(), position.toArray());
		if (lerp >= 1) {
			object3D.position.copy(position);
		} else {
			object3D.position.lerp(position, lerp);
		}
		console.log(object3D.position.toArray());
		if (updateMatrix) {
			object3D.updateMatrix();
		}
	}
}
