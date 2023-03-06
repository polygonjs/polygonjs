// /**
//  * Applies a fillet operation
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import type {OpenCascadeInstance, TopoDS_Shape} from '../../../core/geometry/cad/CadCommon';
// import {step} from '../../../core/geometry/cad/CadConstant';
// import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
// import {traverseEdges} from '../../../core/geometry/cad/CadTraverse';
// import {CadObjectType, cadObjectTypeFromShape} from '../../../core/geometry/cad/CadCommon';
// import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';
// import {TypeAssert} from '../../poly/Assert';

// enum FilletMode {
// 	ROUND = 'round',
// 	STRAIGHT = 'straight',
// }
// const FILLET_MODES: FilletMode[] = [FilletMode.STRAIGHT, FilletMode.ROUND];
// class FilletCadParamsConfig extends NodeParamsConfig {
// 	/** @param mode */
// 	mode = ParamConfig.INTEGER(FILLET_MODES.indexOf(FilletMode.ROUND), {
// 		menu: {
// 			entries: FILLET_MODES.map((name, value) => ({name, value})),
// 		},
// 	});
// 	/** @param radius */
// 	radius = ParamConfig.FLOAT(0.1, {
// 		range: [0, 1],
// 		rangeLocked: [true, false],
// 		step,
// 	});
// }
// const ParamsConfig = new FilletCadParamsConfig();

// export class FilletCadNode extends TypedCadNode<FilletCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'fillet';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		const oc = await CadLoader.core();
// 		const inputCoreGroup = inputCoreGroups[0];

// 		const mode = FILLET_MODES[this.pv.mode];

// 		const inputObjects = inputCoreGroup.objects();
// 		const newObjects: CadCoreObject<CadObjectType>[] = [];
// 		for (let inputObject of inputObjects) {
// 			if (CoreCadType.isShape(inputObject)) {
// 				const shape = inputObject.object();
// 				const api = _getApi(oc, mode, shape);

// 				const radius = this.pv.radius;
// 				let edgesCount = 0;
// 				traverseEdges(oc, shape, (edge) => {
// 					api.Add_2(radius, edge);
// 					edgesCount++;
// 				});
// 				if (edgesCount > 0) {
// 					const newShape = api.Shape();
// 					const type = cadObjectTypeFromShape(oc, newShape);
// 					if (type) {
// 						newObjects.push(new CadCoreObject(newShape, type));
// 					} else {
// 						console.log('no type', newShape);
// 					}
// 				} else {
// 					newObjects.push(inputObject);
// 				}
// 			}
// 		}

// 		this.setCadObjects(newObjects);
// 	}
// }

// function _getApi(oc: OpenCascadeInstance, mode: FilletMode, shape: TopoDS_Shape) {
// 	switch (mode) {
// 		case FilletMode.ROUND: {
// 			return new oc.BRepFilletAPI_MakeFillet(shape, oc.ChFi3d_FilletShape.ChFi3d_Rational as any);
// 		}
// 		case FilletMode.STRAIGHT: {
// 			return new oc.BRepFilletAPI_MakeChamfer(shape);
// 		}
// 	}
// 	TypeAssert.unreachable(mode);
// }
