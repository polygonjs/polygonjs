/**
 * places a CAD 2d curve to a CAD 3d surface
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {CadGeometryType, TopoDS_Shape} from '../../../core/geometry/cad/CadCommon';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {cadFilterObjects, cadFilterShapes} from '../../../core/geometry/cad/utils/CadFilter';

class CADCurve2DToSurfaceSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CADCurve2DToSurfaceSopParamsConfig();

export class CADCurve2DToSurfaceSopNode extends CADSopNode<CADCurve2DToSurfaceSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_CURVE_2D_TO_SURFACE;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(2);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core();
		const inputCurves: CadObject<CadGeometryType.CURVE_2D>[] | undefined = cadFilterObjects(
			inputCoreGroups[0].cadObjects(),
			CadGeometryType.CURVE_2D
		);
		const inputSurfaces = cadFilterShapes(inputCoreGroups[1].cadObjects());

		const newObjects: CadObject<CadGeometryType>[] = [];

		if (inputCurves && inputSurfaces) {
			let i = 0;
			for (let inputCurve of inputCurves) {
				const inputFaceObject = inputSurfaces[i] || inputSurfaces[inputSurfaces.length - 1];
				const shape = inputFaceObject.cadGeometry() as TopoDS_Shape;
				const curve = inputCurve.cadGeometry();
				const curveHandle = new oc.Handle_Geom2d_Curve_2(curve);
				const surface = new oc.BRepLib_FindSurface_2(shape, 0, false, false).Surface();
				const api = new oc.BRepBuilderAPI_MakeEdge_30(curveHandle, surface);

				if (api.IsDone()) {
					const edge = api.Edge();
					const result = oc.BRepLib.BuildCurves3d_2(edge);
					if (result) {
						newObjects.push(new CadObject(edge, CadGeometryType.EDGE));
					}
				}

				i++;
			}
		}
		this.setCADObjects(newObjects);
	}
}
