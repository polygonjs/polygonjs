import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Mesh, Group} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {ThreeMeshBVHHelper} from '../../../core/geometry/bvh/ThreeMeshBVHHelper';
import {
	CENTER,
	AVERAGE,
	SAH,
	StaticGeometryGenerator,
	MeshBVH,
	BufferGeometryWithBVH,
} from '../../../core/geometry/bvh/three-mesh-bvh';
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
	compact: boolean;
}

export class BVHSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BVHSopParams = {
		strategy: CENTER,
		maxLeafTris: 10,
		maxDepth: 40,
		verbose: false,
		compact: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.ALWAYS;
	static override type(): Readonly<'BVH'> {
		return 'BVH';
	}
	override cook(inputCoreGroups: CoreGroup[], params: BVHSopParams) {
		const inputCoreGroup = inputCoreGroups[0];

		if (params.compact == true) {
			const objects = inputCoreGroup.threejsObjects();
			const group = new Group();
			for (const object of objects) {
				group.add(object);

				object.updateMatrixWorld(true); // update children matrix
			}

			const staticGenerator = new StaticGeometryGenerator(group);
			staticGenerator.attributes = ['position'];

			const mergedGeometry = staticGenerator.generate() as BufferGeometryWithBVH;
			mergedGeometry.boundsTree = new MeshBVH(mergedGeometry);

			const mergedMesh = new Mesh(mergedGeometry);
			return this.createCoreGroupFromObjects([mergedMesh]);
		} else {
			const objects = inputCoreGroup.threejsObjects();
			for (let object of objects) {
				object.traverse((child) => {
					const mesh = child as Mesh;
					if (mesh.isMesh) {
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
	}
}
