/**
 * Creates a CAD 3D bezier.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {TopoDS_Shape} from '../../../core/geometry/cad/CadCommon';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';

class CADBezierSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CADBezierSopParamsConfig();

export class CADBezierSopNode extends CADSopNode<CADBezierSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_BEZIER;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const objects = inputCoreGroups[0].cadObjects();

		const vertices: TopoDS_Shape[] = [];
		if (objects) {
			for (let object of objects) {
				if (CoreCadType.isVertex(object)) {
					vertices.push(object.cadGeometry());
				}
			}
		}
		if (vertices.length >= 3) {
			const oc = await CadLoader.core();

			const positions = new oc.TColgp_Array1OfPnt_2(0, vertices.length - 1);
			let index = 0;
			for (let vertex of vertices) {
				const point = oc.BRep_Tool.Pnt(vertex);
				positions.SetValue(index, point);
				index++;
			}

			// const curve = new oc.Geom_BezierCurve_1(positions);
			const interp = new oc.GeomAPI_Interpolate_1(positions as any, true, 0.001);
			const curve = interp.Curve().get();
			const edge = cadEdgeCreate(oc, curve);
			this.setCADShape(edge);
		} else {
			this.setCADObjects([]);
		}
	}
}
