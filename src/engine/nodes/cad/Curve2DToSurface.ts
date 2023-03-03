/**
 * places a 2d curve to a 3d surface
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {CadObjectType, TopoDS_Shape} from '../../../core/geometry/cad/CadCommon';
import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';

class Curve2DToSurfaceCadParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new Curve2DToSurfaceCadParamsConfig();

export class Curve2DToSurfaceCadNode extends TypedCadNode<Curve2DToSurfaceCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'curve2DToSurface';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(2);
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const inputCurves: CadCoreObject<CadObjectType.CURVE_2D>[] = inputCoreGroups[0].objectsWithType(
			CadObjectType.CURVE_2D
		);
		const inputSurfaces = inputCoreGroups[1].objects().filter((o) => CoreCadType.isShape(o));

		const newObjects: CadCoreObject<CadObjectType>[] = [];

		let i = 0;
		for (let inputCurve of inputCurves) {
			const inputFaceObject = inputSurfaces[i] || inputSurfaces[inputSurfaces.length - 1];
			const shape = inputFaceObject.object() as TopoDS_Shape;
			const curve = inputCurve.object();
			const curveHandle = new oc.Handle_Geom2d_Curve_2(curve);
			const surface = new oc.BRepLib_FindSurface_2(shape, 0, false, false).Surface();
			const api = new oc.BRepBuilderAPI_MakeEdge_30(curveHandle, surface);

			if (api.IsDone()) {
				const edge = api.Edge();
				const result = oc.BRepLib.BuildCurves3d_2(edge);
				if (result) {
					newObjects.push(new CadCoreObject(edge));
				}
			}

			i++;
		}

		this.setCadObjects(newObjects);
	}
}
