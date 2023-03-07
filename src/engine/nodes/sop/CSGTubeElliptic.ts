/**
 * Creates an elliptic cylinder.
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import type {maths} from '@jscad/modeling';
import {primitives} from '@jscad/modeling';
import {vector2ToCsgVec2, vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
import {step} from '../../../core/geometry/csg/CsgConstant';
import {csgVec2MultScalar} from '../../../core/geometry/csg/math/CsgMathVec2';
const {cylinderElliptic} = primitives;

class CSGTubeEllipticSopParamsConfig extends NodeParamsConfig {
	/** @param height */
	height = ParamConfig.FLOAT(1, {range: [0, 10]});
	/** @param start radius */
	startRadius = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param start radiuses */
	startRadiuses = ParamConfig.VECTOR2([1, 1]);
	/** @param end radius */
	endRadius = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param end radius */
	endRadiuses = ParamConfig.VECTOR2([1, 1]);
	/** @param segments */
	segments = ParamConfig.INTEGER(32, {
		range: [4, 128],
		rangeLocked: [true, false],
	});
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
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
const ParamsConfig = new CSGTubeEllipticSopParamsConfig();

export class CSGTubeEllipticSopNode extends CSGSopNode<CSGTubeEllipticSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_TUBE_ELLIPTIC;
	}

	private _center: maths.vec3.Vec3 = [0, 0, 0];
	private _startRadiuses: maths.vec2.Vec2 = [0, 0];
	private _endRadiuses: maths.vec2.Vec2 = [0, 0];
	override cook(inputCoreGroups: CoreGroup[]) {
		vector3ToCsgVec3(this.pv.center, this._center);
		vector2ToCsgVec2(this.pv.startRadiuses, this._startRadiuses);
		vector2ToCsgVec2(this.pv.endRadiuses, this._endRadiuses);
		const {startRadius, endRadius, height, segments, open} = this.pv;
		csgVec2MultScalar(this._startRadiuses, startRadius);
		csgVec2MultScalar(this._endRadiuses, endRadius);
		const geo = cylinderElliptic({
			center: this._center,
			height,
			startRadius: this._startRadiuses,
			endRadius: this._endRadiuses,
			segments,
			startAngle: open ? this.pv.startAngle : 0,
			endAngle: open ? this.pv.endAngle : 0,
		});
		this.setCSGGeometry(geo);
	}
}
