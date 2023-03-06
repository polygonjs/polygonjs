// import {Sphere, Object3D, Vector3, Mesh, BufferAttribute} from 'three';
// // import {Object3DWithGeometry} from './Group';

// const _vector = new Vector3();
// const _sphere = new Sphere();
// export function setSphereFromObject(sphere: Sphere, object: Object3D, precise = false) {
// 	sphere.makeEmpty();
// 	expandSphereByObject(sphere, object, precise);
// }
// export function expandSphereByObject(sphere: Sphere, object: Object3D, precise = false) {
// 	// Computes the world-axis-aligned bounding box of an object (including its children),
// 	// accounting for both the object's, and children's, world transforms

// 	object.updateWorldMatrix(false, false);

// 	const geometry = (object as Mesh).geometry;

// 	if (geometry !== undefined) {
// 		if (precise && geometry.attributes != undefined && geometry.attributes.position !== undefined) {
// 			const position = geometry.attributes.position as BufferAttribute;
// 			for (let i = 0, l = position.count; i < l; i++) {
// 				_vector.fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld);
// 				sphere.expandByPoint(_vector);
// 			}
// 		} else {
// 			if (geometry.boundingSphere === null) {
// 				geometry.computeBoundingSphere();
// 			}

// 			if (geometry.boundingSphere) {
// 				_sphere.copy(geometry.boundingSphere);
// 				_sphere.applyMatrix4(object.matrixWorld);

// 				sphere.union(_sphere);
// 			}
// 		}
// 	}

// 	const children = object.children;

// 	for (let i = 0, l = children.length; i < l; i++) {
// 		expandSphereByObject(sphere, children[i], precise);
// 	}

// 	return sphere;
// }

// // function traverseAndInitBoundingSphere(object: Object3D) {
// // 	let sphere: Sphere | undefined;
// // 	object.traverse((childObject) => {
// // 		if (!sphere) {
// // 			const geometry = (childObject as Object3DWithGeometry).geometry;
// // 			if (geometry) {
// // 				// if we do not set updateParents to true,
// // 				// the bounding box calculation appears fine
// // 				// when checking node by node,
// // 				// but will be unreliable when processing multiple transform nodes before
// // 				// rendering the objects
// // 				childObject.updateWorldMatrix(true, false);
// // 				geometry.computeBoundingSphere();
// // 				// this._geometriesWithComputedBoundingBox.add(geometry);
// // 				if (geometry.boundingSphere) {
// // 					sphere = geometry.boundingSphere.clone();
// // 					sphere.applyMatrix4(childObject.matrixWorld);
// // 				}
// // 				// if (bbox) {
// // 				// 	bbox.expandByObject(object);
// // 				// }
// // 			}
// // 		}
// // 	});
// // 	return sphere;
// // }

// // export function computeBoundingSphereFromObject3D(object: Object3D) {
// // 	const sphere = traverseAndInitBoundingSphere(object);
// // 	if (sphere) {
// // 		expandSphereByObject(sphere, object);
// // 	}
// // 	return sphere;
// // }

// // export function computeBoundingSphereFromObject3Ds(objects: Object3D[]) {
// // 	let sphere: Sphere | undefined;
// // 	// this._geometriesWithComputedBoundingBox.clear();
// // 	// 1. Initialize bbox to the first found object
// // 	for (let object of objects) {
// // 		computeBoundingSphereFromObject3D(object);
// // 	}

// // 	// 2. Now that it is initialized, we can loop through the object.
// // 	// If we had not initialized it, this would have skipped objects
// // 	// that have no geometry, but have children that do
// // 	if (sphere) {
// // 		for (let object of objects) {
// // 			// const geometry = (object as Object3DWithGeometry).geometry;
// // 			// if (geometry) {
// // 			// if (!this._geometriesWithComputedBoundingBox.has(geometry)) {
// // 			// 	geometry.computeBoundingBox();
// // 			// }

// // 			if (sphere) {
// // 				expandSphereByObject(sphere, object);
// // 			}
// // 			// }
// // 		}
// // 	}
// // 	sphere = sphere || new Sphere(new Vector3(0, 0, 0), 1);
// // 	return sphere;
// // }
