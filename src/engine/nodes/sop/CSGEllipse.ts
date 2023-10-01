/**
 * Creates a CSG ellipse.
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {vector2ToCsgVec2} from '../../../core/geometry/modules/csg/CsgVecToVector';
import {step} from '../../../core/geometry/modules/csg/CsgConstant';
import type {maths} from '@jscad/modeling';
import {primitives} from '@jscad/modeling';
const {ellipse} = primitives;

class CSGEllipseSopParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.VECTOR2([1, 1]);
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
	endAngle = ParamConfig.FLOAT(Math.PI, {
		range: [0, 2 * Math.PI],
		rangeLocked: [true, true],
		step,
		visibleIf: {open: 1},
	});
}
const ParamsConfig = new CSGEllipseSopParamsConfig();

export class CSGEllipseSopNode extends CSGSopNode<CSGEllipseSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_ELLIPSE;
	}

	private _center: maths.vec2.Vec2 = [0, 0];
	private _radius: maths.vec2.Vec2 = [0, 0];
	override cook(inputCoreGroups: CoreGroup[]) {
		vector2ToCsgVec2(this.pv.center, this._center);
		vector2ToCsgVec2(this.pv.radius, this._radius);
		const {segments, open, startAngle, endAngle} = this.pv;
		const geo = ellipse({
			center: this._center,
			radius: this._radius,
			segments,
			startAngle: open ? startAngle : 0,
			endAngle: open ? endAngle : 0,
		});
		this.setCSGGeometry(geo);
	}
}
