// /**
//  * Mirros input objects
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';
// import {CadObjectType, TopoDS_Wire, cadObjectTypeFromShape} from '../../../core/geometry/cad/CadCommon';

// class PrismCadParamsConfig extends NodeParamsConfig {
// 	/** @param direction */
// 	dir = ParamConfig.VECTOR3([0, 1, 0]);
// 	/** @param height */
// 	height = ParamConfig.FLOAT(1, {
// 		range: [-10, 10],
// 		rangeLocked: [false, false],
// 	});
// }
// const ParamsConfig = new PrismCadParamsConfig();

// export class PrismCadNode extends TypedCadNode<PrismCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'prism';
// 	}

// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override cook(inputCoreGroups: CadCoreGroup[]) {
// 		const oc = CadLoader.oc();
// 		const inputCoreGroup = inputCoreGroups[0];

// 		const prismVec = new oc.gp_Vec_4(
// 			this.pv.dir.x * this.pv.height,
// 			this.pv.dir.y * this.pv.height,
// 			this.pv.dir.z * this.pv.height
// 		);
// 		const inputObjects = inputCoreGroup.objects();
// 		const newObjects: CadCoreObject<CadObjectType>[] = [];
// 		for (let object of inputObjects) {
// 			const wire = object.object() as TopoDS_Wire;
// 			// TODO: cad/convert or cad/makeFace
// 			const faceApi = new oc.BRepBuilderAPI_MakeFace_15(wire, true);
// 			const face = faceApi.Face();
// 			const prismApi = new oc.BRepPrimAPI_MakePrism_1(face, prismVec, false, true);
// 			const prism = prismApi.Shape();
// 			const type = cadObjectTypeFromShape(oc, prism);
// 			if (type) {
// 				const newObject = new CadCoreObject(prism, type);
// 				newObjects.push(newObject);
// 			}
// 		}

// 		this.setCadObjects(newObjects);
// 	}
// }
