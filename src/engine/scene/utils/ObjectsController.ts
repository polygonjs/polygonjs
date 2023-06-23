import {PolyScene} from '../PolyScene';
import {Object3D} from 'three';
import {CorePath, CorePathObjCallback} from '../../../core/geometry/CorePath';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';

export const ROOT_NAME = '/';

export class ObjectsController {
	constructor(private scene: PolyScene) {}

	findObjectByMask<T extends CoreObjectType>(mask: string): ObjectContent<T> | undefined {
		return CorePath.findObjectByMask(mask, this.scene.threejsScene());
	}

	objectsByMask<T extends CoreObjectType>(mask: string, parent?: ObjectContent<T>): ObjectContent<T>[] {
		return CorePath.objectsByMask(mask, parent || this.scene.threejsScene());
	}

	traverseObjectsWithMask<T extends CoreObjectType>(
		mask: string,
		callback: CorePathObjCallback<T>,
		object: Object3D | undefined,
		invertMask: boolean = false
	) {
		CorePath.traverseObjectsWithMaskInObject(mask, object || this.scene.threejsScene(), callback, invertMask);
	}
}
