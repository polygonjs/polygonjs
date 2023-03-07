// /**
//  * Extrude the geometry and rotates it
//  *
//  *
//  */
// import {TypedCsgNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
// import {step} from '../../../core/geometry/csg/CsgUiUtils';
// import {extrusions, geometries} from '@jscad/modeling';
// const {extrudeRotate} = extrusions;

// class ExtrudeRotateCsgParamsConfig extends NodeParamsConfig {
// 	/** @param angle */
// 	angle = ParamConfig.FLOAT(0, {
// 		range: [-2 * Math.PI, 2 * Math.PI],
// 		rangeLocked: [false, false],
// 		step,
// 	});
// 	/** @param start angle */
// 	startAngle = ParamConfig.FLOAT(0, {
// 		range: [-2 * Math.PI, 2 * Math.PI],
// 		rangeLocked: [false, false],
// 		step,
// 	});
// 	/** @param segments */
// 	segments = ParamConfig.INTEGER(4, {
// 		range: [1, 64],
// 		rangeLocked: [true, false],
// 	});
// }
// const ParamsConfig = new ExtrudeRotateCsgParamsConfig();

// export class ExtrudeRotateCsgNode extends TypedCsgNode<ExtrudeRotateCsgParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'extrudeRotate';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override cook(inputCoreGroups: CsgCoreGroup[]) {
// 		const options: extrusions.ExtrudeRotateOptions = {
// 			angle: this.pv.angle,
// 			startAngle: this.pv.startAngle,
// 			segments: this.pv.segments * 4,
// 		};
// 		const objects = inputCoreGroups[0]
// 			.objects()
// 			.map((o) => {
// 				if (geometries.geom2.isA(o)) {
// 					return extrudeRotate(options, o);
// 				} else {
// 					return o;
// 				}
// 			})
// 			.flat();
// 		this.setCsgCoreObjects(objects);
// 	}
// }
