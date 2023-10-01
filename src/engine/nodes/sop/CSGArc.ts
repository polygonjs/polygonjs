/**
 * Creates a CSG arc.
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {vector2ToCsgVec2} from '../../../core/geometry/modules/csg/CsgVecToVector';
import {step} from '../../../core/geometry/modules/csg/CsgConstant';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import type {maths} from '@jscad/modeling';
import {primitives} from '@jscad/modeling';
const {arc} = primitives;

class CSGArcSopParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(1, {range: [0, 10]});
	/** @param segments */
	segments = ParamConfig.INTEGER(32, {
		range: [4, 128],
		rangeLocked: [true, false],
	});
	/** @param center */
	center = ParamConfig.VECTOR2([0, 0]);
	/** @param make tangents */
	makeTangent = ParamConfig.BOOLEAN(0);
	/** @param start angle */
	startAngle = ParamConfig.FLOAT(0, {
		range: [0, 2 * Math.PI],
		rangeLocked: [true, true],
		step,
	});
	/** @param end angle */
	endAngle = ParamConfig.FLOAT('$PI', {
		range: [0, 2 * Math.PI],
		rangeLocked: [true, true],
		step,
	});
}
const ParamsConfig = new CSGArcSopParamsConfig();

export class CSGArcSopNode extends CSGSopNode<CSGArcSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_ARC;
	}

	private _center: maths.vec2.Vec2 = [0, 0];
	override cook(inputCoreGroups: CoreGroup[]) {
		vector2ToCsgVec2(this.pv.center, this._center);
		const {radius, segments, makeTangent, startAngle, endAngle} = this.pv;
		const geo = arc({
			center: this._center,
			radius,
			segments,
			makeTangent,
			startAngle,
			endAngle,
		});
		this.setCSGGeometry(geo);
	}
}
