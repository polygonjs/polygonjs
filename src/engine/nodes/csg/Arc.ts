// /**
//  * Creates an arc.
//  *
//  *
//  */
// import {TypedCsgNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
// import type {maths} from '@jscad/modeling';
// import {primitives} from '@jscad/modeling';
// import {vector2ToCsgVec2} from '../../../core/geometry/csg/CsgVecToVector';
// import {step} from '../../../core/geometry/csg/CsgUiUtils';
// const {arc} = primitives;

// class ArcCsgParamsConfig extends NodeParamsConfig {
// 	/** @param center */
// 	center = ParamConfig.VECTOR2([0, 0]);
// 	/** @param radius */
// 	radius = ParamConfig.FLOAT(1, {range: [0, 10]});
// 	/** @param segments */
// 	segments = ParamConfig.INTEGER(32, {
// 		range: [4, 128],
// 		rangeLocked: [true, false],
// 	});
// 	/** @param make tangents */
// 	makeTangent = ParamConfig.BOOLEAN(0);
// 	/** @param start angle */
// 	startAngle = ParamConfig.FLOAT(0, {
// 		range: [0, 2 * Math.PI],
// 		rangeLocked: [true, true],
// 		step,
// 	});
// 	/** @param end angle */
// 	endAngle = ParamConfig.FLOAT('$PI', {
// 		range: [0, 2 * Math.PI],
// 		rangeLocked: [true, true],
// 		step,
// 	});
// }
// const ParamsConfig = new ArcCsgParamsConfig();

// export class ArcCsgNode extends TypedCsgNode<ArcCsgParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'arc';
// 	}

// 	private _center: maths.vec2.Vec2 = [0, 0];
// 	override cook(inputCoreGroups: CsgCoreGroup[]) {
// 		vector2ToCsgVec2(this.pv.center, this._center);
// 		const {radius, segments, makeTangent, startAngle, endAngle} = this.pv;
// 		const geo = arc({
// 			center: this._center,
// 			radius,
// 			segments,
// 			makeTangent,
// 			startAngle,
// 			endAngle,
// 		});
// 		this.setCsgCoreObject(geo);
// 	}
// }
