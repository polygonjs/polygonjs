/**
 * converts points and curves from 2D to 3D and vice-versa
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {cadPlaneXY} from '../../../core/geometry/cad/CadMath';
import {OpenCascadeInstance, CadGeometryType, gp_Pln} from '../../../core/geometry/cad/CadCommon';
import {gp_Pnt2d, Geom2d_Curve, TopoDS_Vertex, TopoDS_Edge} from '../../../core/geometry/cad/CadCommon';
import {cadVertexCreate} from '../../../core/geometry/cad/toObject3D/CadVertex';
import {curveDataFromEdge, cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';
import {Vector3} from 'three';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {CadLoaderSync} from '../../../core/geometry/cad/CadLoaderSync';

export enum ConversionMode {
	TO_2D = 'to 2D',
	TO_3D = 'to 3D',
}
export const CONVERSION_MODES: ConversionMode[] = [ConversionMode.TO_2D, ConversionMode.TO_3D];

class CADConvertDimensionSopParamsConfig extends NodeParamsConfig {
	/** @param mode */
	mode = ParamConfig.INTEGER(CONVERSION_MODES.indexOf(ConversionMode.TO_3D), {
		menu: {
			entries: CONVERSION_MODES.map((name, value) => ({name, value})),
		},
	});
	/** @param axis */
	// axis = ParamConfig.VECTOR3([0, 0, 1]);
}
const ParamsConfig = new CADConvertDimensionSopParamsConfig();

export class CADConvertDimensionSopNode extends CADSopNode<CADConvertDimensionSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_CONVERT_DIMENSION;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	setMode(mode: ConversionMode) {
		this.p.mode.set(CONVERSION_MODES.indexOf(mode));
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const oc = CadLoaderSync.oc();

		const mode = CONVERSION_MODES[this.pv.mode];
		const plane = cadPlaneXY(); //cadPlaneFromAxis(this.pv.axis)

		const newObjects: CadObject<CadGeometryType>[] = [];
		const inputObjects = inputCoreGroups[0].cadObjects();

		if (inputObjects) {
			switch (mode) {
				case ConversionMode.TO_2D: {
					for (let inputObject of inputObjects) {
						const type = inputObject.type;
						switch (type) {
							case CadGeometryType.VERTEX: {
								if (CoreCadType.isVertex(inputObject)) {
									convertVertexToPoint2D(oc, inputObject.cadGeometry(), plane, newObjects);
								}
								break;
							}
							case CadGeometryType.EDGE: {
								if (CoreCadType.isEdge(inputObject)) {
									convertEdgeToCurve2D(oc, inputObject.cadGeometry(), plane, newObjects);
								}
								break;
							}
							default:
								newObjects.push(inputObject);
						}
					}

					break;
				}
				case ConversionMode.TO_3D: {
					for (let inputObject of inputObjects) {
						const type = inputObject.type;
						switch (type) {
							case CadGeometryType.POINT_2D: {
								if (CoreCadType.isPoint2d(inputObject)) {
									convertPoint2DToVertex(oc, inputObject.cadGeometry(), plane, newObjects);
								}
								break;
							}
							case CadGeometryType.CURVE_2D: {
								if (CoreCadType.isGeom2dCurve(inputObject)) {
									convertCurve2DToEdge(oc, inputObject.cadGeometry(), plane, newObjects);
								}
								break;
							}
							default:
								newObjects.push(inputObject);
						}
					}
					break;
				}
			}
		}

		this.setCADObjects(newObjects);
	}
}

const tmpV3 = new Vector3();

// to 2D
function convertVertexToPoint2D(
	oc: OpenCascadeInstance,
	vertex: TopoDS_Vertex,
	plane: gp_Pln,
	newObjects: CadObject<CadGeometryType>[]
) {
	const point = oc.BRep_Tool.Pnt(vertex);
	const pnt2D = new oc.gp_Pnt2d_3(point.X(), point.Y());
	newObjects.push(new CadObject(pnt2D, CadGeometryType.POINT_2D));
}
function convertEdgeToCurve2D(
	oc: OpenCascadeInstance,
	edge: TopoDS_Edge,
	plane: gp_Pln,
	newObjects: CadObject<CadGeometryType>[]
) {
	const handle3D = curveDataFromEdge(oc, edge).curveHandle;
	const curve3D = handle3D.get();
	if (!curve3D) {
		return;
	}
	const handle2D = oc.GeomAPI.To2d(handle3D, cadPlaneXY());
	const curve2D = handle2D.get();
	if (!curve2D) {
		return;
	}
	newObjects.push(new CadObject(curve2D, CadGeometryType.CURVE_2D));
}

// to 3D
function convertPoint2DToVertex(
	oc: OpenCascadeInstance,
	point2D: gp_Pnt2d,
	plane: gp_Pln,
	newObjects: CadObject<CadGeometryType>[]
) {
	tmpV3.set(point2D.X(), point2D.Y(), 0);
	const vertex = cadVertexCreate(oc, tmpV3);
	newObjects.push(new CadObject(vertex, CadGeometryType.VERTEX));
}
function convertCurve2DToEdge(
	oc: OpenCascadeInstance,
	curve2D: Geom2d_Curve,
	plane: gp_Pln,
	newObjects: CadObject<CadGeometryType>[]
) {
	const handle2D = new oc.Handle_Geom2d_Curve_2(curve2D);
	const handle3D = oc.GeomAPI.To3d(handle2D, cadPlaneXY());
	const curve3D = handle3D.get();
	if (!curve3D) {
		return;
	}
	const edge = cadEdgeCreate(oc, curve3D);
	handle2D.delete();
	newObjects.push(new CadObject(edge, CadGeometryType.EDGE));
}
