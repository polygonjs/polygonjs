// /**
//  * Creates a 2D bezier.
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {gp_Pnt2d} from '../../../core/geometry/cad/CadCommon';
// import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';

// class Bezier2DCadParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new Bezier2DCadParamsConfig();

// export class Bezier2DCadNode extends TypedCadNode<Bezier2DCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'bezier2D';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		const objects = inputCoreGroups[0].objects();

// 		const points: gp_Pnt2d[] = [];
// 		for (let object of objects) {
// 			if (CoreCadType.isPoint2d(object)) {
// 				points.push(object.object());
// 			}
// 		}
// 		console.log(points.length);
// 		if (points.length >= 3) {
// 			const oc = await CadLoader.core();

// 			const positions = new oc.TColgp_Array1OfPnt2d_2(0, points.length - 1);
// 			console.log('size', positions.Size());
// 			let index = 0;
// 			for (let point of points) {
// 				positions.SetValue(index, point);
// 				index++;
// 			}

// 			const bezier = new oc.Geom2d_BezierCurve_1(positions);
// 			// const curve = circle3Points.Value().get();
// 			console.log({bezier});
// 			this.setGeom2dCurve(bezier);
// 		} else {
// 			this.setCadObjects([]);
// 		}
// 	}
// }
