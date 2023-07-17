import {Object3D, Vector3} from 'three';
import {ObjectNamedFunction3} from './_Base';
import {Object3DWithGeometry} from '../../core/geometry/Group';
import {Attribute} from '../../core/geometry/Attribute';

const _v3 = new Vector3();

export class setPointPosition extends ObjectNamedFunction3<[number, Vector3, number]> {
	static override type() {
		return 'setPointPosition';
	}
	func(object3D: Object3D, ptnum: number, position: Vector3, lerp: number): void {
		const geometry = (object3D as Object3DWithGeometry).geometry;
		if (!geometry) {
			return;
		}
		const positionAttribute = geometry.getAttribute(Attribute.POSITION);
		if (!positionAttribute) {
			return;
		}
		if (lerp >= 1) {
			position.toArray(positionAttribute.array as number[], ptnum * 3);
		} else {
			_v3.fromBufferAttribute(positionAttribute, ptnum);
			_v3.lerp(position, lerp);
			_v3.toArray(positionAttribute.array as number[], ptnum * 3);
		}
		positionAttribute.needsUpdate = true;
	}
}
