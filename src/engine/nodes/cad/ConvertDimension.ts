// /**
//  * converts points and curves from 2D to 3D and vice-versa
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
// import {cadPlaneXY} from '../../../core/geometry/cad/CadMath';
// import {OpenCascadeInstance, CadObjectType, gp_Pln} from '../../../core/geometry/cad/CadCommon';
// import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';
// import {gp_Pnt2d, Geom2d_Curve, TopoDS_Vertex, TopoDS_Edge} from '../../../core/geometry/cad/CadCommon';
// import {cadVertexCreate} from '../../../core/geometry/cad/toObject3D/CadVertex';
// import {curveHandleFromEdge, cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';
// import {Vector3} from 'three';

// enum ConversionMode {
// 	TO_2D = 'to 2D',
// 	TO_3D = 'to 3D',
// }
// const CONVERSION_MODES: ConversionMode[] = [ConversionMode.TO_2D, ConversionMode.TO_3D];

// class ConvertDimensionCadParamsConfig extends NodeParamsConfig {
// 	/** @param mode */
// 	mode = ParamConfig.INTEGER(CONVERSION_MODES.indexOf(ConversionMode.TO_3D), {
// 		menu: {
// 			entries: CONVERSION_MODES.map((name, value) => ({name, value})),
// 		},
// 	});
// 	/** @param axis */
// 	// axis = ParamConfig.VECTOR3([0, 0, 1]);
// }
// const ParamsConfig = new ConvertDimensionCadParamsConfig();

// export class ConvertDimensionCadNode extends TypedCadNode<ConvertDimensionCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'convertDimension';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		const oc = await CadLoader.core();

// 		const mode = CONVERSION_MODES[this.pv.mode];
// 		const plane = cadPlaneXY(); //cadPlaneFromAxis(this.pv.axis)

// 		const newObjects: CadCoreObject<CadObjectType>[] = [];
// 		const inputObjects = inputCoreGroups[0].objects();

// 		switch (mode) {
// 			case ConversionMode.TO_2D: {
// 				for (let inputObject of inputObjects) {
// 					const type = inputObject.type();
// 					switch (type) {
// 						case CadObjectType.VERTEX: {
// 							if (CoreCadType.isVertex(inputObject)) {
// 								convertVertexToPoint2D(oc, inputObject.object(), plane, newObjects);
// 							}
// 							break;
// 						}
// 						case CadObjectType.EDGE: {
// 							if (CoreCadType.isEdge(inputObject)) {
// 								convertEdgeToCurve2D(oc, inputObject.object(), plane, newObjects);
// 							}
// 							break;
// 						}
// 						default:
// 							newObjects.push(inputObject);
// 					}
// 				}

// 				break;
// 			}
// 			case ConversionMode.TO_3D: {
// 				for (let inputObject of inputObjects) {
// 					const type = inputObject.type();
// 					switch (type) {
// 						case CadObjectType.POINT_2D: {
// 							if (CoreCadType.isPoint2d(inputObject)) {
// 								convertPoint2DToVertex(oc, inputObject.object(), plane, newObjects);
// 							}
// 							break;
// 						}
// 						case CadObjectType.CURVE_2D: {
// 							if (CoreCadType.isGeom2dCurve(inputObject)) {
// 								convertCurve2DToEdge(oc, inputObject.object(), plane, newObjects);
// 							}
// 							break;
// 						}
// 						default:
// 							newObjects.push(inputObject);
// 					}
// 				}
// 				break;
// 			}
// 		}

// 		this.setCadObjects(newObjects);
// 	}
// }

// const tmpV3 = new Vector3();

// // to 2D
// function convertVertexToPoint2D(
// 	oc: OpenCascadeInstance,
// 	vertex: TopoDS_Vertex,
// 	plane: gp_Pln,
// 	newObjects: CadCoreObject<CadObjectType>[]
// ) {
// 	const point = oc.BRep_Tool.Pnt(vertex);
// 	const pnt2D = new oc.gp_Pnt2d_3(point.X(), point.Y());
// 	newObjects.push(new CadCoreObject(pnt2D, CadObjectType.POINT_2D));
// }
// function convertEdgeToCurve2D(
// 	oc: OpenCascadeInstance,
// 	edge: TopoDS_Edge,
// 	plane: gp_Pln,
// 	newObjects: CadCoreObject<CadObjectType>[]
// ) {
// 	const handle3D = curveHandleFromEdge(oc, edge);
// 	const curve3D = handle3D.get();
// 	if (!curve3D) {
// 		return;
// 	}
// 	const handle2D = oc.GeomAPI.To2d(handle3D, cadPlaneXY());
// 	const curve2D = handle2D.get();
// 	if (!curve2D) {
// 		return;
// 	}
// 	newObjects.push(new CadCoreObject(curve2D, CadObjectType.CURVE_2D));
// }

// // to 3D
// function convertPoint2DToVertex(
// 	oc: OpenCascadeInstance,
// 	point2D: gp_Pnt2d,
// 	plane: gp_Pln,
// 	newObjects: CadCoreObject<CadObjectType>[]
// ) {
// 	tmpV3.set(point2D.X(), point2D.Y(), 0);
// 	const vertex = cadVertexCreate(oc, tmpV3);
// 	newObjects.push(new CadCoreObject(vertex));
// }
// function convertCurve2DToEdge(
// 	oc: OpenCascadeInstance,
// 	curve2D: Geom2d_Curve,
// 	plane: gp_Pln,
// 	newObjects: CadCoreObject<CadObjectType>[]
// ) {
// 	const handle2D = new oc.Handle_Geom2d_Curve_2(curve2D);
// 	const handle3D = oc.GeomAPI.To3d(handle2D, cadPlaneXY());
// 	const curve3D = handle3D.get();
// 	if (!curve3D) {
// 		return;
// 	}
// 	const edge = cadEdgeCreate(oc, curve3D);
// 	newObjects.push(new CadCoreObject(edge));
// }
