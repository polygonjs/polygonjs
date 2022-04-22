import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Mesh} from 'three';
import {Material} from 'three';
import {BufferGeometry} from 'three';
import {ObjectType} from '../../../core/geometry/Constant';
import {isBooleanTrue} from '../../../core/Type';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {ThreeMeshBVHHelper} from './utils/Bvh/ThreeMeshBVHHelper';
import {CoreGeometryBuilderMerge} from '../../../core/geometry/builders/Merge';

interface BVHSopParams extends DefaultOperationParams {
	keepOnlyPosition: boolean;
}

export class BVHSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BVHSopParams = {
		keepOnlyPosition: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.ALWAYS;
	static override type(): Readonly<'BVH'> {
		return 'BVH';
	}
	override cook(input_contents: CoreGroup[], params: BVHSopParams) {
		const allMeshes: Mesh[] = [];
		for (let input_core_group of input_contents) {
			if (input_core_group) {
				const objects = input_core_group.objects();
				for (let object of objects) {
					object.traverse((child) => {
						const mesh = child as Mesh;
						if (mesh.isMesh) {
							if (isBooleanTrue(params.keepOnlyPosition)) {
								const geometry = mesh.geometry;
								for (const key in geometry.attributes) {
									if (key !== 'position') {
										geometry.deleteAttribute(key);
									}
								}
							}

							allMeshes.push(mesh);
						}
					});
				}
			}
		}
		const mergedMesh = this._makeCompact(allMeshes);
		if (mergedMesh) {
			mergedMesh.matrixAutoUpdate = false;

			ThreeMeshBVHHelper.assignBVH(mergedMesh);

			return this.createCoreGroupFromObjects([mergedMesh]);
		} else {
			return this.createCoreGroupFromObjects([]);
		}
	}
	private _makeCompact(allMeshes: Mesh[]) {
		const geometries: BufferGeometry[] = [];
		let material: Material | undefined;
		for (let mesh of allMeshes) {
			material = material || (mesh.material as Material);
			const geometry = mesh.geometry;
			geometry.applyMatrix4(mesh.matrix);
			geometries.push(geometry);
		}

		// TODO: test that this works with geometries with same attributes
		try {
			const mergedGeometry = CoreGeometryBuilderMerge.merge(geometries);
			if (mergedGeometry) {
				const mesh = this.createObject(mergedGeometry, ObjectType.MESH, material);
				return mesh;
			} else {
				this.states?.error.set('merge failed, check that input geometries have the same attributes');
			}
		} catch (e) {
			this.states?.error.set((e as Error).message);
		}
	}
}
