/**
 * Creates a tetrahedron.
 *
 *
 */
import {TetSopNode as BaseTetSopNode} from './_BaseTet';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {TetGeometry} from '../../../core/geometry/tet/TetGeometry';

class TetBoxSopParamsConfig extends NodeParamsConfig {
	p0 = ParamConfig.VECTOR3([-1, 0, -1]);
	p1 = ParamConfig.VECTOR3([1, 0, -1]);
	p2 = ParamConfig.VECTOR3([0, 1, 1]);
	p3 = ParamConfig.VECTOR3([0, -1, 1]);
	scale = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	center = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new TetBoxSopParamsConfig();

export class TetSopNode extends BaseTetSopNode<TetBoxSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TET;
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const geometry = new TetGeometry();

		const {center, scale, p0, p1, p2, p3} = this.pv;
		const i0 = geometry.addPoint(p0.clone().multiplyScalar(scale).add(center));
		const i1 = geometry.addPoint(p1.clone().multiplyScalar(scale).add(center));
		const i2 = geometry.addPoint(p2.clone().multiplyScalar(scale).add(center));
		const i3 = geometry.addPoint(p3.clone().multiplyScalar(scale).add(center));

		// for (let tetFace of TET_FACES) {
		// 	geometry.addFace(tetFace[0], tetFace[1], tetFace[2]);
		// }
		geometry.addTetrahedron(i0, i1, i2, i3);

		this.setTetGeometries([geometry]);
	}
}
