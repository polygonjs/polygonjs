/**
 * test geometry
 *
 *
 */
import {TetSopNode} from './_BaseTet';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {bunnyMesh} from '../../../core/softBody/Bunny';
import {TetGeometry} from '../../../core/geometry/tet/TetGeometry';
import {tetRemoveUnusedPoints} from '../../../core/geometry/tet/utils/tetRemoveUnusedPoints';

class TetBunnySopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new TetBunnySopParamsConfig();

export class TetBunnySopNode extends TetSopNode<TetBunnySopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'tetBunny';
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const {verts, tetIds} = bunnyMesh;

		const geometry = new TetGeometry();

		const pointsCount = verts.length / 3;
		for (let i = 0; i < pointsCount; i++) {
			const stride = i * 3;
			const x = verts[stride];
			const y = verts[stride + 1];
			const z = verts[stride + 2];
			geometry.addPoint(x, y, z);
		}
		const tetsCount = tetIds.length / 4;
		for (let i = 0; i < tetsCount; i++) {
			const stride = i * 4;
			const i0 = tetIds[stride];
			const i1 = tetIds[stride + 1];
			const i2 = tetIds[stride + 2];
			const i3 = tetIds[stride + 3];
			geometry.addTetrahedron(i0, i1, i2, i3);
		}
		tetRemoveUnusedPoints(geometry);
		this.setTetGeometry(geometry);
	}
}
