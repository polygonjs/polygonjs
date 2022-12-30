import {PolyScene} from '../PolyScene';
import {Object3D} from 'three';
import {CorePath, CorePathObjCallback} from '../../../core/geometry/CorePath';

export const ROOT_NAME = '/';

export class ObjectsController {
	constructor(private scene: PolyScene) {}

	findObjectByMask(mask: string): Object3D | undefined {
		return CorePath.findObjectByMask(mask, this.scene.threejsScene());
	}

	objectsByMask(mask: string, parent?: Object3D): Object3D[] {
		return CorePath.objectsByMask(mask, parent || this.scene.threejsScene());
	}

	traverseObjectsWithMask(
		mask: string,
		callback: CorePathObjCallback,
		object: Object3D | undefined,
		invertMask: boolean = false
	) {
		CorePath.traverseObjectsWithMaskInObject(mask, object || this.scene.threejsScene(), callback, invertMask);
	}
}
