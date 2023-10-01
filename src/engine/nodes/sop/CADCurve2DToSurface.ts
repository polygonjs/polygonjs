/**
 * places a CAD 2d curve to a CAD 3d surface
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CadGC, CadGeometryType, TopoDS_Shape} from '../../../core/geometry/modules/cad/CadCommon';
import {CadObject} from '../../../core/geometry/modules/cad/CadObject';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {cadFilterObjects, cadFilterShapes} from '../../../core/geometry/modules/cad/utils/CadFilter';
import {CadLoaderSync} from '../../../core/geometry/modules/cad/CadLoaderSync';

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

	override cook(inputCoreGroups: CoreGroup[]) {
		const oc = CadLoaderSync.oc();
		const inputCurves: CadObject<CadGeometryType.CURVE_2D>[] | undefined = cadFilterObjects(
			inputCoreGroups[0].cadObjects(),
			CadGeometryType.CURVE_2D
		);
		const inputSurfaces = cadFilterShapes(inputCoreGroups[1].cadObjectsWithShape());

		const newObjects: CadObject<CadGeometryType>[] = [];

		if (inputCurves && inputSurfaces) {
			let i = 0;
			CadGC.withGC((r) => {
				for (const inputCurve of inputCurves) {
					const inputFaceObject = inputSurfaces[i] || inputSurfaces[inputSurfaces.length - 1];
					const shape = inputFaceObject.cadGeometry() as TopoDS_Shape;
					const curve = inputCurve.cadGeometry();
					const curveHandle = r(new oc.Handle_Geom2d_Curve_2(curve));
					const findSurface = r(new oc.BRepLib_FindSurface_2(shape, 0, false, false));
					const surfaceHandle = findSurface.Surface();
					const api = r(new oc.BRepBuilderAPI_MakeEdge_30(curveHandle, surfaceHandle));
					if (api.IsDone()) {
						const edge = api.Edge();
						const result = oc.BRepLib.BuildCurves3d_2(edge);
						if (result) {
							newObjects.push(new CadObject(edge, CadGeometryType.EDGE));
						}
					}

					i++;
				}
			});
		}
		this.setCADObjects(newObjects);
	}
}
