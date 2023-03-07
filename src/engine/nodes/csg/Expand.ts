// /**
//  * Expand the geometry
//  *
//  *
//  */
// import {TypedCsgNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
// import {expansions, maths} from '@jscad/modeling';
// import {CsgCorner, CSG_CORNERS} from '../../../core/geometry/csg/operations/CsgCorner';
// const {expand} = expansions;

// class ExpandCsgParamsConfig extends NodeParamsConfig {
// 	/** @param delta */
// 	delta = ParamConfig.FLOAT(0.1, {
// 		range: [1 * maths.constants.EPS, 1],
// 		rangeLocked: [true, false],
// 	});
// 	/** @param corners */
// 	corners = ParamConfig.INTEGER(CSG_CORNERS.indexOf(CsgCorner.ROUND), {
// 		menu: {entries: CSG_CORNERS.map((name, value) => ({name, value}))},
// 	});
// 	/** @param segments */
// 	segments = ParamConfig.INTEGER(1, {
// 		range: [1, 8],
// 		rangeLocked: [true, false],
// 	});
// }
// const ParamsConfig = new ExpandCsgParamsConfig();

// export class ExpandCsgNode extends TypedCsgNode<ExpandCsgParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'expand';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override cook(inputCoreGroups: CsgCoreGroup[]) {
// 		const minDelta = 1 * maths.constants.EPS;
// 		const delta = Math.max(this.pv.delta, minDelta);
// 		const options: expansions.ExpandOptions = {
// 			delta,
// 			corners: CSG_CORNERS[this.pv.corners],
// 			segments: this.pv.segments * 4,
// 		};
// 		const objects = inputCoreGroups[0]
// 			.objects()
// 			.map((o) => expand(options, o))
// 			.flat();
// 		this.setCsgCoreObjects(objects);
// 	}
// }
