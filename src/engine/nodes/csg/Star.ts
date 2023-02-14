/**
 * Creates a star.
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import {primitives, maths} from '@jscad/modeling';
import {vector2ToCsgVec2} from '../../../core/geometry/csg/CsgVecToVector';
const {star} = primitives;

class StarCsgParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new StarCsgParamsConfig();

export class StarCsgNode extends TypedCsgNode<StarCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'star';
	}

	private _center: maths.vec2.Vec2 = [0, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
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
			this.setCsgCoreObject(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCsgCoreObjects([]);
		}
	}
}
