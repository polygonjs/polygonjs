/**
 * TBD
 *
 *
 */
import {TetSopNode} from './_BaseTet';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {bunnyMesh} from '../../../core/softBody/Bunny';
import {TetGeometry} from '../../../core/geometry/tet/TetGeometry';

console.log({
	verts: bunnyMesh.verts.length,
	tetIds: bunnyMesh.tetIds.length,
	tetSurfaceTriIds: bunnyMesh.tetSurfaceTriIds.length,
	tetEdgeIds: bunnyMesh.tetEdgeIds.length,
});
console.log(bunnyMesh);
const pairs: Map<number, number> = new Map();
const edgesCount = bunnyMesh.tetEdgeIds.length / 2;
for (let i = 0; i < edgesCount; i++) {
	const id0 = bunnyMesh.tetEdgeIds[i * 2];
	const id1 = bunnyMesh.tetEdgeIds[i * 2 + 1];
	pairs.set(id0, id1);
}
console.log(pairs);
for (let i = 0; i < edgesCount; i++) {
	const id0 = bunnyMesh.tetEdgeIds[i * 2];
	const id1 = bunnyMesh.tetEdgeIds[i * 2 + 1];
	if (pairs.get(id1) == id0) {
		console.log('double edge');
	}
}
class TetBunnySopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new TetBunnySopParamsConfig();

export class TetBunnySopNode extends TetSopNode<TetBunnySopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'tetBunny';
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		console.log(bunnyMesh);

		const geometry = new TetGeometry();

		const pointsCount = bunnyMesh.verts.length / 3;
		for (let i = 0; i < pointsCount; i++) {
			const x = bunnyMesh.verts[i * 3];
			const y = bunnyMesh.verts[i * 3 + 1];
			const z = bunnyMesh.verts[i * 3 + 2];
			geometry.addPoint(x, y, z);
		}
		const tetsCount = bunnyMesh.tetIds.length / 4;
		for (let i = 0; i < tetsCount; i++) {
			const i0 = bunnyMesh.tetIds[i * 4];
			const i1 = bunnyMesh.tetIds[i * 4 + 1];
			const i2 = bunnyMesh.tetIds[i * 4 + 2];
			const i3 = bunnyMesh.tetIds[i * 4 + 3];
			geometry.addTetrahedron(i0, i1, i2, i3);
		}
		this.setTetGeometry(geometry);

		// const bufferGeometry = new BufferGeometry();
		// const pos = new Float32Array(bunnyMesh.verts);
		// bufferGeometry.setAttribute('position', new BufferAttribute(pos, 3));
		// bufferGeometry.setIndex(bunnyMesh.tetSurfaceTriIds);
		// bufferGeometry.computeVertexNormals();
		// // console.log(bufferGeometry);

		// this.setGeometries([bufferGeometry]);
	}
}
