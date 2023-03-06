// /**
//  * Applies a revolution operation
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {step} from '../../../core/geometry/csg/CsgUiUtils';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
// import {CadObjectType, cadObjectTypeFromShape, TopoDS_Edge} from '../../../core/geometry/cad/CadCommon';
// import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';
// import {
// 	cadAxis,
// 	// cadPlaneXY
// } from '../../../core/geometry/cad/CadMath';
// import {curveHandleFromEdge} from '../../../core/geometry/cad/toObject3D/CadEdge';
// import {traverseEdges} from '../../../core/geometry/cad/CadTraverse';
// // import {withCadException} from '../../../core/geometry/cad/CadExceptionHandler';

// class RevolutionCadParamsConfig extends NodeParamsConfig {
// 	/** @param axis */
// 	axis = ParamConfig.VECTOR3([0, 1, 0]);
// 	/** @param closed */
// 	closed = ParamConfig.BOOLEAN(true);
// 	/** @param thetaMin */
// 	// thetaMin = ParamConfig.FLOAT(0, {
// 	// 	range: [0, 2 * Math.PI],
// 	// 	rangeLocked: [false, false],
// 	// 	step,
// 	// 	visibleIf: {closed: false},
// 	// });
// 	/** @param thetaMax */
// 	// thetaMax = ParamConfig.FLOAT(`2*$PI`, {
// 	// 	range: [0, 2 * Math.PI],
// 	// 	rangeLocked: [false, false],
// 	// 	step,
// 	// 	visibleIf: {closed: false},
// 	// });
// 	/** @param phi */
// 	phi = ParamConfig.FLOAT(`2*$PI`, {
// 		range: [0, 2 * Math.PI],
// 		rangeLocked: [true, true],
// 		step,
// 		visibleIf: {closed: false},
// 	});
// }
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
// 		const inputObjects = coreGroup0.objects();
// 		const newObjects: CadCoreObject<CadObjectType>[] = [];
// 		const axis = cadAxis(this.pv.axis);

// 		// const thetaMin = Math.min(this.pv.thetaMin, this.pv.thetaMax);
// 		// const thetaMax = Math.max(this.pv.thetaMin, this.pv.thetaMax);

// 		const createRevolution = (edge: TopoDS_Edge) => {
// 			const handle = curveHandleFromEdge(oc, edge);
// 			const api = new oc.BRepPrimAPI_MakeRevolution_6(axis, handle, this.pv.phi);
// 			const newShape = api.Shape();
// 			const type = cadObjectTypeFromShape(oc, newShape);
// 			if (type) {
// 				newObjects.push(new CadCoreObject(newShape, type));
// 			} else {
// 				console.log('no type', newShape);
// 			}
// 		};

// 		for (let inputObject of inputObjects) {
// 			const type = inputObject.type();
// 			switch (type) {
// 				case CadObjectType.CURVE_2D: {
// 					// if (CoreCadType.isGeom2dCurve(inputObject)) {
// 					// 	const curve2D = inputObject.object();
// 					// 	// const api = new oc.GeomAPI()
// 					// 	console.log('A');
// 					// 	const handle2D = new oc.Handle_Geom2d_Curve_2(curve2D);
// 					// 	console.log('B');
// 					// 	const handle = oc.GeomAPI.To3d(handle2D, cadPlaneXY());
// 					// 	console.log('C');
// 					// 	const api = new oc.BRepLib_MakeEdge_24(handle);
// 					// 	console.log('D');
// 					// 	const edge = api.Edge();
// 					// 	console.log('E');
// 					// 	withCadException(oc, () => {
// 					// 		const result = oc.BRepLib.BuildCurves3d_2(edge);
// 					// 		if (result) {
// 					// 			createRevolution(edge);
// 					// 		}
// 					// 	});
// 					// 	console.log('F');
// 					// }
// 					// break;
// 				}
// 				case CadObjectType.EDGE: {
// 					if (CoreCadType.isEdge(inputObject)) {
// 						createRevolution(inputObject.object());
// 					}
// 					break;
// 				}
// 				case CadObjectType.WIRE: {
// 					if (CoreCadType.isWire(inputObject)) {
// 						traverseEdges(oc, inputObject.object(), (edge) => {
// 							createRevolution(edge);
// 						});
// 					}
// 					break;
// 				}
// 			}
// 		}

// 		this.setCadObjects(newObjects);
// 	}
// }
