/**
 * Creates a CSG circle.
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {vector2ToCsgVec2} from '../../../core/geometry/csg/CsgVecToVector';
import {step} from '../../../core/geometry/csg/CsgConstant';
import type {maths} from '@jscad/modeling';
import {primitives} from '@jscad/modeling';
const {circle} = primitives;

class CSGCircleSopParamsConfig extends NodeParamsConfig {
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
	/** @param center */
	center = ParamConfig.VECTOR2([0, 0]);
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
const ParamsConfig = new CSGCircleSopParamsConfig();

export class CSGCircleSopNode extends CSGSopNode<CSGCircleSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_CIRCLE;
	}

	private _center: maths.vec2.Vec2 = [0, 0];
	override cook(inputCoreGroups: CoreGroup[]) {
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
			this.setCSGGeometry(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCSGObjects([]);
		}
	}
}
