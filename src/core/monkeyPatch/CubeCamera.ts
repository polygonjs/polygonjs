/**
 *
 * monkey patching the cubeCamera by replacing the copy method
 * does not work because it does not override it from Object3D.
 * We are therefore replacing nothing. Or it should be updated in the prototype.
 * So instead we are simply extending the class with CubeCameraExtended
 *
 */

// import {Object3D, CubeCamera} from 'three';

// export function monkeyPatchCubeCamera(cubeCamera: CubeCamera) {
// 	console.log('monkeyPatchCubeCamera', cubeCamera);
// 	const previousCopy = cubeCamera.copy.bind(cubeCamera);

// 	cubeCamera.copy = function (source: CubeCamera, recursive: boolean) {
// 		console.warn('cubeCamera copy');
// 		const clonedCubeCamera = previousCopy(source, recursive);
// 		// remove current children
// 		let child: Object3D | undefined;
// 		while ((child = clonedCubeCamera.children[0])) {
// 			clonedCubeCamera.remove(child);
// 		}
// 		console.log(clonedCubeCamera.children.length);

// 		// then re-add the source ones only (and not the ones created in the constructor)
// 		for (let srcChild of source.children) {
// 			clonedCubeCamera.add(srcChild.clone());
// 		}
// 		console.log(clonedCubeCamera.children.length);

// 		monkeyPatchCubeCamera(clonedCubeCamera);
// 		return clonedCubeCamera;
// 	};
// 	console.log('prevCopy', previousCopy, cubeCamera.copy);
// }
