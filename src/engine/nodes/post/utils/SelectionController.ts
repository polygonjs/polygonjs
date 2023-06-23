import {PolyScene} from '../../../scene/PolyScene';
import {Selection} from 'postprocessing';
import {Object3D} from 'three';

export class SelectionController {
	private _map: Map<string, Object3D> = new Map();
	private _resolvedObjects: Object3D[] = [];
	updateSelection(scene: PolyScene, objectsMask: string, selection: Selection) {
		const foundObjects = scene.objectsByMask(objectsMask) as Object3D[];

		// Ensure that we only give the top most parents to the pass.
		// Meaning that if foundObjects contains a node A and one of its children B,
		// only A is given.
		this._map.clear();
		for (let object of foundObjects) {
			this._map.set(object.uuid, object);
		}
		const isAncestorNotInList = (object: Object3D) => {
			let isAncestorInList = false;
			object.traverseAncestors((ancestor) => {
				if (this._map.has(ancestor.uuid)) {
					isAncestorInList = true;
				}
			});
			return !isAncestorInList;
		};
		this._resolvedObjects = foundObjects.filter(isAncestorNotInList);
		selection.clear();
		for (let object of this._resolvedObjects) {
			selection.add(object);
		}
	}
}
