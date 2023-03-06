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
// import {CadObjectType, TopoDS_Shape, cadObjectTypeFromShape} from '../../../core/geometry/cad/CadCommon';
// import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';

// // TODO: make sure it works for 3D as well
// class MirrorCadParamsConfig extends NodeParamsConfig {
// 	/** @param origin */
// 	// origin = ParamConfig.VECTOR3([0, 0, 0]);
// 	/** @param axis */
// 	axis = ParamConfig.VECTOR3([0, 1, 0]);
// }
// const ParamsConfig = new MirrorCadParamsConfig();

// export class MirrorCadNode extends TypedCadNode<MirrorCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'mirror';
// 	}

// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override cook(inputCoreGroups: CadCoreGroup[]) {
// 		const oc = CadLoader.oc();
// 		const inputCoreGroup = inputCoreGroups[0];

// 		const axis = new oc.gp_Ax1_1();
// 		const dir = new oc.gp_Dir_4(this.pv.axis.x, this.pv.axis.y, this.pv.axis.z);
// 		axis.SetDirection(dir);
// 		const aTrsf = new oc.gp_Trsf_1();
// 		aTrsf.SetMirror_2(axis);
// 		const inputObjects = inputCoreGroup.objects();
// 		const newObjects: CadCoreObject<CadObjectType>[] = [];
// 		for (let object of inputObjects) {
// 			if (CoreCadType.isShape(object)) {
// 				const shape = object.object() as TopoDS_Shape;
// 				const transform = new oc.BRepBuilderAPI_Transform_2(shape, aTrsf, false);
// 				const mirroredShape = transform.Shape();
// 				const type = cadObjectTypeFromShape(oc, mirroredShape);
// 				if (type) {
// 					newObjects.push(new CadCoreObject(mirroredShape, type));
// 				}
// 			}
// 		}

// 		this.setCadObjects(newObjects);
// 	}
// }
