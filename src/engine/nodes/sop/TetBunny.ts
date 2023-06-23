// /**
//  * TBD
//  *
//  *
//  */
// import {TypedSopNode} from './_Base';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {bunnyMesh} from '../../../core/softBody/Bunny';
// import {BufferGeometry, BufferAttribute} from 'three';

// console.log({
// 	verts: bunnyMesh.verts.length,
// 	tetIds: bunnyMesh.tetIds.length,
// 	tetSurfaceTriIds: bunnyMesh.tetSurfaceTriIds.length,
// 	tetEdgeIds: bunnyMesh.tetEdgeIds.length,
// });
// console.log(bunnyMesh);
// const pairs: Map<number, number> = new Map();
// const edgesCount = bunnyMesh.tetEdgeIds.length / 2;
// for (let i = 0; i < edgesCount; i++) {
// 	const id0 = bunnyMesh.tetEdgeIds[i * 2];
// 	const id1 = bunnyMesh.tetEdgeIds[i * 2 + 1];
// 	pairs.set(id0, id1);
// }
// console.log(pairs);
// for (let i = 0; i < edgesCount; i++) {
// 	const id0 = bunnyMesh.tetEdgeIds[i * 2];
// 	const id1 = bunnyMesh.tetEdgeIds[i * 2 + 1];
// 	if (pairs.get(id1) == id0) {
// 		console.log('double edge');
// 	}
// }
// class TetBunnySopParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new TetBunnySopParamsConfig();

// export class TetBunnySopNode extends TypedSopNode<TetBunnySopParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'tetBunny';
// 	}

// 	override cook(inputCoreGroups: CoreGroup[]) {
// 		const bufferGeometry = new BufferGeometry();

// 		const pos = new Float32Array(bunnyMesh.verts);
// 		bufferGeometry.setAttribute('position', new BufferAttribute(pos, 3));
// 		bufferGeometry.setIndex(bunnyMesh.tetSurfaceTriIds);
// 		bufferGeometry.computeVertexNormals();
// 		// console.log(bufferGeometry);

// 		this.setGeometries([bufferGeometry]);
// 	}
// }
