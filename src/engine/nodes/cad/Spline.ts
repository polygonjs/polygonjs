// /**
//  * Creates a spline curve.
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CoreCadType, gp_Pnt_3} from '../../../core/geometry/cad/CadCommon';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';

// class SplineCadParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new SplineCadParamsConfig();

// export class SplineCadNode extends TypedCadNode<SplineCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'spline';
// 	}

// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		const objects = inputCoreGroups[0].objects();

// 		const points: gp_Pnt_3[] = [];
// 		for (let object of objects) {
// 			if (CoreCadType.isPoint(object)) {
// 				points.push(object);
// 			}
// 		}
// 		if (points.length >= 3) {
// 			const oc = await CadLoader.core();
// 			const circle3Points = new oc.GC_MakeArcOfCircle_4(points[0], points[1], points[2]);
// 			const curve = circle3Points.Value().get();
// 			console.log(curve);
// 			this.setCurve(curve);
// 		} else {
// 			this.setCadObjects([]);
// 		}
// 	}
// }
