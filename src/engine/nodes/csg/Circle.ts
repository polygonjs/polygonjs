/**
 * Creates a circle.
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import type {maths} from '@jscad/modeling';
import {primitives} from '@jscad/modeling';
import {vector2ToCsgVec2} from '../../../core/geometry/csg/CsgVecToVector';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
const {circle} = primitives;

class CircleCsgParamsConfig extends NodeParamsConfig {
	/** @param center */
	center = ParamConfig.VECTOR2([0, 0]);
	/** @param radius */
	radius = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param segments */
	segments = ParamConfig.INTEGER(32, {
		range: [4, 128],
		rangeLocked: [true, false],
	});
	/** @param open */
	open = ParamConfig.BOOLEAN(0);
	/** @param start angle */
	startAngle = ParamConfig.FLOAT(0, {
		range: [0, 2 * Math.PI],
		rangeLocked: [true, true],
		step,
		visibleIf: {open: 1},
	});
	/** @param end angle */
	endAngle = ParamConfig.FLOAT('$PI', {
		range: [0, 2 * Math.PI],
		rangeLocked: [true, true],
		step,
		visibleIf: {open: 1},
	});
}
const ParamsConfig = new CircleCsgParamsConfig();

export class CircleCsgNode extends TypedCsgNode<CircleCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'circle';
	}

	private _center: maths.vec2.Vec2 = [0, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
		vector2ToCsgVec2(this.pv.center, this._center);
		try {
			const {radius, startAngle, endAngle, segments, open} = this.pv;
			const geo = circle({
				center: this._center,
				radius: radius,
				segments: segments,
				startAngle: open ? startAngle : 0,
				endAngle: open ? endAngle : 0,
			});
			this.setCsgCoreObject(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCsgCoreObjects([]);
		}
	}
}
