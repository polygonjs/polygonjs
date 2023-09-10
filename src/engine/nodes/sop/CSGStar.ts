/**
 * Creates a CSG star.
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {primitives, maths} from '@jscad/modeling';
import {vector2ToCsgVec2} from '../../../core/geometry/modules/csg/CsgVecToVector';
const {star} = primitives;

class CSGStarSopParamsConfig extends NodeParamsConfig {
	/** @param center */
	center = ParamConfig.VECTOR2([0, 0]);
	/** @param vertices */
	vertices = ParamConfig.INTEGER(5, {
		range: [2, 10],
		rangeLocked: [true, false],
	});
	/** @param outer radius */
	innerRadius = ParamConfig.FLOAT(1, {
		range: [2 * maths.constants.EPS, 10],
		rangeLocked: [true, false],
	});
	/** @param outer radius */
	outerRadius = ParamConfig.FLOAT(2, {
		range: [2 * maths.constants.EPS, 10],
		rangeLocked: [true, false],
	});
	/** @param start angle */
	startAngle = ParamConfig.FLOAT(0, {
		range: [0, 2 * Math.PI],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new CSGStarSopParamsConfig();

export class CSGStarSopNode extends CSGSopNode<CSGStarSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_STAR;
	}

	private _center: maths.vec2.Vec2 = [0, 0];
	override cook(inputCoreGroups: CoreGroup[]) {
		try {
			vector2ToCsgVec2(this.pv.center, this._center);
			const {vertices, outerRadius, innerRadius, startAngle} = this.pv;
			const geo = star({
				center: this._center,
				vertices,
				outerRadius,
				innerRadius,
				startAngle,
			});
			this.setCSGGeometry(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCSGObjects([]);
		}
	}
}
