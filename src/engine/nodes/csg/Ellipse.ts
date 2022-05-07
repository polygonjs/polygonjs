/**
 * Creates an ellipse.
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {vector2ToCsgVec2} from '../../../core/geometry/csg/CsgVecToVector';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
const {ellipse} = jscad.primitives;

class EllipseCsgParamsConfig extends NodeParamsConfig {
	/** @param center */
	center = ParamConfig.VECTOR2([0, 0]);
	/** @param radius */
	radius = ParamConfig.VECTOR2([1, 1]);
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
	endAngle = ParamConfig.FLOAT(Math.PI, {
		range: [0, 2 * Math.PI],
		rangeLocked: [true, true],
		step,
		visibleIf: {open: 1},
	});
}
const ParamsConfig = new EllipseCsgParamsConfig();

export class EllipseCsgNode extends TypedCsgNode<EllipseCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'ellipse';
	}

	private _center: jscad.maths.vec2.Vec2 = [0, 0];
	private _radius: jscad.maths.vec2.Vec2 = [0, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
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
		this.setCsgCoreObject(geo);
	}
}
