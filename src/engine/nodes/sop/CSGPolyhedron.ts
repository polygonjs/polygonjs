/**
 * Creates CSG Polyhedrons.
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import type {maths} from '@jscad/modeling';
import {primitives} from '@jscad/modeling';
import {csgVec3sToJSON} from '../../../core/geometry/csg/math/CsgMathVec3';
const {polyhedron} = primitives;

const DEFAULT_POINTS: maths.vec3.Vec3[] = [
	[-1, -1, -1],
	[-1, -1, 1],
	[1, 1, 1],
	[1, 1, -1],
];
const DEFAULT_FACES: Array<Array<number>> = [[0, 1, 2, 3]];

class CSGPolyhedronSopParamsConfig extends NodeParamsConfig {
	/** @param points */
	points = ParamConfig.STRING(JSON.stringify(csgVec3sToJSON(DEFAULT_POINTS)));
	/** @param paths */
	faces = ParamConfig.STRING(JSON.stringify(DEFAULT_FACES));
	/** @param outward */
	outward = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new CSGPolyhedronSopParamsConfig();

export class CSGPolyhedronSopNode extends CSGSopNode<CSGPolyhedronSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_POLYHEDRON;
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		try {
			const points = JSON.parse(this.pv.points);
			const faces = JSON.parse(this.pv.faces);
			const geo = polyhedron({
				points,
				faces,
				orientation: this.pv.outward ? 'outward' : 'inward',
			});
			this.setCSGGeometry(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCSGObjects([]);
		}
	}
}
