import {Box3, Object3D, Vector3} from 'three';
import {Object3DWithGeometry} from './Group';

function traverseAndInitBoundingBox(object: Object3D) {
	let bbox: Box3 | undefined;
	object.traverse((childObject) => {
		if (!bbox) {
			const geometry = (childObject as Object3DWithGeometry).geometry;
			if (geometry) {
				// if we do not set updateParents to true,
				// the bounding box calculation appears fine
				// when checking node by node,
				// but will be unreliable when processing multiple transform nodes before
				// rendering the objects
				childObject.updateWorldMatrix(true, false);
				geometry.computeBoundingBox();
				// this._geometriesWithComputedBoundingBox.add(geometry);
				if (geometry.boundingBox) {
					bbox = geometry.boundingBox.clone();
					bbox.applyMatrix4(childObject.matrixWorld);
				}
				// if (bbox) {
				// 	bbox.expandByObject(object);
				// }
			}
		}
	});
	return bbox;
}

export function computeBoundingBoxFromObject3D(object: Object3D) {
	const bbox = traverseAndInitBoundingBox(object);
	if (bbox) {
		bbox.expandByObject(object);
	}
	return bbox;
}

export function computeBoundingBoxFromObject3Ds(objects: Object3D[]) {
	let bbox: Box3 | undefined;
	// this._geometriesWithComputedBoundingBox.clear();
	// 1. Initialize bbox to the first found object
	for (const object of objects) {
		computeBoundingBoxFromObject3D(object);
	}

	// 2. Now that it is initialized, we can loop through the object.
	// If we had not initialized it, this would have skipped objects
	// that have no geometry, but have children that do
	if (bbox) {
		for (const object of objects) {
			// const geometry = (object as Object3DWithGeometry).geometry;
			// if (geometry) {
			// if (!this._geometriesWithComputedBoundingBox.has(geometry)) {
			// 	geometry.computeBoundingBox();
			// }

			if (bbox) {
				bbox.expandByObject(object);
			}
			// }
		}
	}
	bbox = bbox || new Box3(new Vector3(-1, -1, -1), new Vector3(+1, +1, +1));
	return bbox;
}
