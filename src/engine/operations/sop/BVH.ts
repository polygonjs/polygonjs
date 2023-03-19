import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Mesh} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {ThreeMeshBVHHelper} from '../../../core/geometry/bvh/ThreeMeshBVHHelper';
import {CENTER, AVERAGE, SAH} from '../../../core/geometry/bvh/three-mesh-bvh';
const nameByStragery = {
	[CENTER]: 'center',
	[AVERAGE]: 'average',
	[SAH]: 'sah',
};
export const STRAGERY_MENU_ENTRIES = [CENTER, AVERAGE, SAH].map((value) => {
	return {name: nameByStragery[value], value};
});

interface BVHSopParams extends DefaultOperationParams {
	strategy: number;
	maxLeafTris: number;
	maxDepth: number;
	verbose: boolean;
	keepOnlyPosition: boolean;
}

export class BVHSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BVHSopParams = {
		strategy: CENTER,
		maxLeafTris: 10,
		maxDepth: 40,
		verbose: false,
		keepOnlyPosition: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.ALWAYS;
	static override type(): Readonly<'BVH'> {
		return 'BVH';
	}
	override cook(inputCoreGroups: CoreGroup[], params: BVHSopParams) {
		// const allMeshes: Mesh[] = [];
		const inputCoreGroup = inputCoreGroups[0];
		// for (let inputCoreGroup of inputCoreGroups) {
		if (inputCoreGroup) {
			const objects = inputCoreGroup.threejsObjects();
			for (let object of objects) {
				object.traverse((child) => {
					const mesh = child as Mesh;
					if (mesh.isMesh) {
						// if (isBooleanTrue(params.keepOnlyPosition)) {
						// 	const geometry = mesh.geometry;
						// 	for (const key in geometry.attributes) {
						// 		if (key !== 'position') {
						// 			geometry.deleteAttribute(key);
						// 		}
						// 	}
						// }

						// allMeshes.push(mesh);
						const bvh = ThreeMeshBVHHelper.createBVH(mesh, {
							strategy: params.strategy,
							maxLeafTris: params.maxLeafTris,
							maxDepth: params.maxDepth,
							verbose: params.verbose,
						});
						ThreeMeshBVHHelper.assignBVH(mesh, bvh);
					}
				});
			}
		}
		return inputCoreGroup;
		// }
		// const mergedMesh = this._makeCompact(allMeshes);
		// if (mergedMesh) {
		// 	mergedMesh.matrixAutoUpdate = false;

		// 	const bvh = ThreeMeshBVHHelper.createBVH(mergedMesh, {
		// 		maxLeafTris: params.maxLeafTris,
		// 		verbose: params.verbose,
		// 	});
		// 	ThreeMeshBVHHelper.assignBVH(mergedMesh, bvh);

		// 	return this.createCoreGroupFromObjects([mergedMesh]);
		// } else {
		// 	return this.createCoreGroupFromObjects([]);
		// }
	}
	// private _makeCompact(allMeshes: Mesh[]) {
	// 	const geometries: BufferGeometry[] = [];
	// 	let material: Material | undefined;
	// 	for (let mesh of allMeshes) {
	// 		material = material || (mesh.material as Material);
	// 		const geometry = mesh.geometry;
	// 		geometry.applyMatrix4(mesh.matrix);
	// 		geometries.push(geometry);
	// 	}

	// 	// TODO: test that this works with geometries with same attributes
	// 	try {
	// 		const mergedGeometry = CoreGeometryBuilderMerge.merge(geometries);
	// 		if (mergedGeometry) {
	// 			const mesh = this.createObject(mergedGeometry, ObjectType.MESH, material);
	// 			return mesh;
	// 		} else {
	// 			this.states?.error.set('merge failed, check that input geometries have the same attributes');
	// 		}
	// 	} catch (e) {
	// 		this.states?.error.set((e as Error).message);
	// 	}
	// }
}
