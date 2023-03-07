/**
 * Creates a CSG triangle.
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import type {maths} from '@jscad/modeling';
import {primitives} from '@jscad/modeling';
import {MathUtils} from 'three';
const {degToRad} = MathUtils;
const {triangle} = primitives;

enum TriangleType {
	AAA = 'AAA',
	AAS = 'AAS',
	ASA = 'ASA',
	SAS = 'SAS',
	SSA = 'SSA',
	SSS = 'SSS',
}
const TRIANGLE_TYPES: TriangleType[] = [
	TriangleType.AAA,
	TriangleType.AAS,
	TriangleType.ASA,
	TriangleType.SAS,
	TriangleType.SSA,
	TriangleType.SSS,
];

class CSGTriangleSopParamsConfig extends NodeParamsConfig {
	/** @param type */
	type = ParamConfig.INTEGER(TRIANGLE_TYPES.indexOf(TriangleType.AAA), {
		menu: {entries: TRIANGLE_TYPES.map((name, value) => ({name, value}))},
	});
	/** @param angles */
	angles = ParamConfig.VECTOR2([60, 60]);
}
const ParamsConfig = new CSGTriangleSopParamsConfig();

export class CSGTriangleSopNode extends CSGSopNode<CSGTriangleSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_TRIANGLE;
	}

	private _angles: maths.vec3.Vec3 = [0, 0, 0];
	override cook(inputCoreGroups: CoreGroup[]) {
		try {
			const angles = this.pv.angles;
			const angle0 = degToRad(angles.x);
			const angle1 = degToRad(angles.y);
			const angle2 = Math.PI - (angle0 + angle1);
			this._angles[0] = angle0;
			this._angles[1] = angle1;
			this._angles[2] = angle2;
			const geo = triangle({
				type: TRIANGLE_TYPES[this.pv.type],
				values: this._angles,
			});
			this.setCSGGeometry(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCSGObjects([]);
		}
	}
}
