import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DefaultOperationParams} from '../../../core/operations/_Base';
// import {bunnyMesh} from '../../../core/softBody/Bunny';
import {Object3D, Mesh} from 'three';
import {createTets} from '../../../core/geometry/tetrahedron/TetrahedronCreate';
import {ObjectType} from '../../../core/geometry/Constant';
import {MeshWithBVHGeometry, ThreeMeshBVHHelper} from '../../../core/geometry/bvh/ThreeMeshBVHHelper';
import {logBlueBg} from '../../../core/logger/Console';
import {TET_CREATION_STAGES} from '../../../core/geometry/tetrahedron/TetrahedronConstant';
// import { BufferGeometryWithBVH } from '../../../core/geometry/bvh/three-mesh-bvh';
// function _makeBunny() {
// 	const geometry = new BufferGeometry();
// 	const pos = new Float32Array(bunnyMesh.verts);
// 	geometry.setAttribute('position', new BufferAttribute(pos, 3));
// 	geometry.setIndex(bunnyMesh.tetSurfaceTriIds);
// 	geometry.computeVertexNormals();

// 	return geometry;
// }

interface TetrahedralizeSopParams extends DefaultOperationParams {
	resolution: number;
	minQualityExp: number;
	oneFacePerTet: boolean;
	tetScale: number;
	stage: number;
	subStage: number;
}

export class TetrahedralizeSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: TetrahedralizeSopParams = {
		resolution: 10,
		minQualityExp: -3,
		oneFacePerTet: true,
		tetScale: 0.8,
		stage: 0,
		subStage: 0,
	};
	static override type(): Readonly<'tetrahedralize'> {
		return 'tetrahedralize';
	}

	override cook(inputCoreGroups: CoreGroup[], params: TetrahedralizeSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.threejsObjectsWithGeo() as Mesh[];
		const newObjects: Object3D[] = [];

		const stage = TET_CREATION_STAGES[params.stage];
		logBlueBg(`****************** tetrahedralize START (${stage})`);

		for (let object of objects) {
			// const geometry = _makeBunny();
			// const object = this.createObject(geometry, ObjectType.MESH);

			ThreeMeshBVHHelper.assignDefaultBVHIfNone(object);

			const tetGeometry = createTets({
				mesh: object as MeshWithBVHGeometry,
				resolution: params.resolution,
				minQuality: Math.pow(10.0, params.minQualityExp),
				oneFacePerTet: params.oneFacePerTet,
				scale: params.tetScale,
				//
				stage: stage,
				subStage: params.subStage,
			});
			const objectType = params.stage == 0 ? ObjectType.POINTS : ObjectType.MESH;
			newObjects.push(this.createObject(tetGeometry, objectType));
		}
		logBlueBg(`****************** tetrahedralize END (${stage})`);

		return this.createCoreGroupFromObjects(newObjects);
	}
}
