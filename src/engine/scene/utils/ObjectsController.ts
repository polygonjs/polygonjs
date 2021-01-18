import {PolyScene} from '../PolyScene';
import {CoreString} from '../../../core/String';
import {Object3D} from 'three/src/core/Object3D';

export class ObjectsController {
	constructor(private scene: PolyScene) {}

	findObjectByMask(mask: string): Object3D | undefined {
		return this._findObjectsByMaskInObject(mask, this.scene.threejsScene(), '');
	}
	private _findObjectsByMaskInObject(mask: string, object: Object3D, objectPath: string): Object3D | undefined {
		for (let child of object.children) {
			const path = `${objectPath}/${child.name}`;
			if (CoreString.matchMask(path, mask)) {
				return child;
			}
			this._findObjectsByMaskInObject(mask, child, path);
		}
	}

	objectsByMask(mask: string): Object3D[] {
		const list: Object3D[] = [];
		const root = this.scene.threejsScene();
		this._objectsByMaskInObject(mask, root, '', list);
		return list;
	}
	private _objectsByMaskInObject(mask: string, object: Object3D, objectPath: string, list: Object3D[]) {
		for (let child of object.children) {
			const path = `${objectPath}/${child.name}`;
			if (CoreString.matchMask(path, mask)) {
				list.push(child);
			}
			this._objectsByMaskInObject(mask, child, path, list);
		}
	}
}
