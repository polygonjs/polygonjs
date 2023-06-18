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
import {TET_VERTICES_BASE} from '../../../core/geometry/tet/TetCommon';
import {Vector3} from 'three';

const _p = new Vector3();

class TetBoxSopParamsConfig extends NodeParamsConfig {
	p0 = ParamConfig.VECTOR3(TET_VERTICES_BASE[0]);
	p1 = ParamConfig.VECTOR3(TET_VERTICES_BASE[1]);
	p2 = ParamConfig.VECTOR3(TET_VERTICES_BASE[2]);
	p3 = ParamConfig.VECTOR3(TET_VERTICES_BASE[3]);
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
		_p.copy(p0).normalize().multiplyScalar(scale).add(center);
		const i0 = geometry.addPoint(_p.x, _p.y, _p.z);
		_p.copy(p1).normalize().multiplyScalar(scale).add(center);
		const i1 = geometry.addPoint(_p.x, _p.y, _p.z);
		_p.copy(p2).normalize().multiplyScalar(scale).add(center);
		const i2 = geometry.addPoint(_p.x, _p.y, _p.z);
		_p.copy(p3).normalize().multiplyScalar(scale).add(center);
		const i3 = geometry.addPoint(_p.x, _p.y, _p.z);

		geometry.addTetrahedron(i0, i1, i2, i3);

		this.setTetGeometries([geometry]);
	}
}
