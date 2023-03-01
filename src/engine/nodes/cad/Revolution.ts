// /**
//  * Applies a revolution operation
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';

// class RevolutionCadParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new RevolutionCadParamsConfig();

// export class RevolutionCadNode extends TypedCadNode<RevolutionCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'revolution';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		// TODO: if input is 2d, convert to 3d
// 		// provide axis, angle, min, max
// 		const oc = await CadLoader.core();
// 		const coreGroup0 = inputCoreGroups[0];

// 		const object0 = coreGroup0.objects()[0];

// 		if (CoreCadType.isGeomCurve(object0)) {
// 			const handle = new oc.Handle_Geom_Curve_2(object0.object());
// 			const builder = new oc.BRepPrimAPI_MakeRevolution_1(handle);

// 			this.setShape(builder.Shape());
// 			return;
// 		}

// 		this.setCadObjects([]);
// 	}
// }
