import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {MeshBVH, acceleratedRaycast, BufferGeometryWithBvh} from './utils/Bvh/three-mesh-bvh';
import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {ObjectType} from '../../../core/geometry/Constant';

interface BVHSopParams extends DefaultOperationParams {}

export class BVHSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: BVHSopParams = {};
	static readonly INPUT_CLONED_STATE = InputCloneMode.ALWAYS;
	static type(): Readonly<'BVH'> {
		return 'BVH';
	}
	cook(input_contents: CoreGroup[], params: BVHSopParams) {
		const allMeshes: Mesh[] = [];
		for (let input_core_group of input_contents) {
			if (input_core_group) {
				const objects = input_core_group.objects();
				for (let object of objects) {
					object.traverse((child) => {
						const mesh = child as Mesh;
						if (mesh.isMesh) {
							const geometry = mesh.geometry;
							for (const key in geometry.attributes) {
								if (key !== 'position') {
									geometry.deleteAttribute(key);
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
			mergedMesh.raycast = acceleratedRaycast;
			const bhv = new MeshBVH(mergedMesh.geometry, {verbose: false});
			(mergedMesh.geometry as BufferGeometryWithBvh).boundsTree = bhv;

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
			const mergedGeometry = CoreGeometry.mergeGeometries(geometries);
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
