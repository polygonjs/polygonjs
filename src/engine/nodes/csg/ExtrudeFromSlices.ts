// /**
//  * Extrude the geometry in a rectangle
//  *
//  *
//  */
// import {TypedCsgNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
// import jscad from '@jscad/modeling';
// const {extrudeFromSlices} = jscad.extrusions;

// class ExtrudeFromSlicesCsgParamsConfig extends NodeParamsConfig {
// 	/** @param numberOfSlices */
// 	numberOfSlices = ParamConfig.INTEGER(2, {
// 		range: [0, 16],
// 		rangeLocked: [true, false],
// 	});
// 	/** @param cap Start */
// 	capStart = ParamConfig.BOOLEAN(0);
// 	/** @param cap End */
// 	capEnd = ParamConfig.BOOLEAN(0);
// }
// const ParamsConfig = new ExtrudeFromSlicesCsgParamsConfig();

// export class ExtrudeFromSlicesCsgNode extends TypedCsgNode<ExtrudeFromSlicesCsgParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'extrudeFromSlices';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override cook(inputCoreGroups: CsgCoreGroup[]) {
// 		const options: jscad.extrusions.ExtrudeFromSlicesOptions<any> = {
// 			numberOfSlices: this.pv.numberOfSlices,
// 			capStart: this.pv.capStart,
// 			capEnd: this.pv.capEnd,
// 		};
// 		const objects = inputCoreGroups[0]
// 			.objects()
// 			.map((o) => {
// 				if (jscad.geometries.geom2.isA(o) || jscad.geometries.path2.isA(o)) {
// 					return extrudeFromSlices(options, o);
// 				} else {
// 					return o;
// 				}
// 			})
// 			.flat();
// 		this.setCsgCoreObjects(objects);
// 	}
// }
