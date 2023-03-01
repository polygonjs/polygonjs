// /**
//  * Creates a 2D Spline.
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {gp_Pnt2d_3} from '../../../core/geometry/cad/CadCommon';
// import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
// import {withCadException} from '../../../core/geometry/cad/CadExceptionHandler';

// class Spline2DCadParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new Spline2DCadParamsConfig();

// export class Spline2DCadNode extends TypedCadNode<Spline2DCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'Spline2D';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		const objects = inputCoreGroups[0].objects();

// 		const points: gp_Pnt2d_3[] = [];
// 		for (let object of objects) {
// 			if (CoreCadType.isPoint2d(object)) {
// 				points.push(object.object());
// 			}
// 		}
// 		console.log(points.length);
// 		if (points.length >= 3) {
// 			const oc = await CadLoader.core();

// 			withCadException(oc, () => {
// 				const positions = new oc.TColgp_Array1OfPnt2d_2(0, points.length - 1);
// 				const knots = new oc.TColStd_Array1OfReal_2(0, points.length - 1);
// 				const multiplicities = new oc.TColStd_Array1OfInteger_2(0, points.length - 1);
// 				const degree = 5;
// 				const periodic = false;
// 				console.log('size', positions.Size());
// 				let index = 0;
// 				for (let point of points) {
// 					positions.SetValue(index, point);
// 					knots.SetValue(index, index + 1);
// 					multiplicities.SetValue(index, degree - 2);
// 					index++;
// 				}

// 				console.log('A');
// 				const spline = new oc.Geom2d_BSplineCurve_1(positions, knots, multiplicities, degree, periodic);
// 				console.log('B');
// 				this.setGeom2dCurve(spline);
// 			});
// 			// const positions = new oc.TColgp_Array1OfPnt2d_2(0, points.length - 1);
// 			// const knots = new oc.TColStd_Array1OfReal_2(0, points.length - 1);
// 			// const multiplicities = new oc.TColStd_Array1OfInteger_2(0, points.length - 1);
// 			// const degree = 3;
// 			// const periodic = false;
// 			// console.log('size', positions.Size());
// 			// let index = 0;
// 			// for (let point of points) {
// 			// 	positions.SetValue(index, point);
// 			// 	knots.SetValue(index, index + 1);
// 			// 	multiplicities.SetValue(index, index + 1);
// 			// 	index++;
// 			// }

// 			// const Spline = new oc.Geom2d_BSplineCurve_1(positions, knots, multiplicities, degree, periodic);
// 			// // const curve = circle3Points.Value().get();
// 			// console.log({Spline});
// 			this.setCadObjects([]);
// 		} else {
// 			this.setCadObjects([]);
// 		}
// 	}
// }
