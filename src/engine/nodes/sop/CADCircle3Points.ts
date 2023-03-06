/**
 * Creates a CAD arc from 3 points.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import type {TopoDS_Vertex} from '../../../core/geometry/cad/CadCommon';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGroup} from '../../../core/geometry/Group';

class CADCircle3PointsSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CADCircle3PointsSopParamsConfig();

export class CADCircle3PointsSopNode extends CADSopNode<CADCircle3PointsSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_CIRCLE_3_POINTS;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const cadObjects = inputCoreGroups[0].cadObjects();

		const vertices: TopoDS_Vertex[] = [];
		if (cadObjects) {
			for (let object of cadObjects) {
				if (CoreCadType.isVertex(object)) {
					vertices.push(object.cadGeometry());
				}
			}
		}
		if (vertices.length >= 3) {
			const oc = await CadLoader.core();
			const point0 = oc.BRep_Tool.Pnt(vertices[0]);
			const point1 = oc.BRep_Tool.Pnt(vertices[1]);
			const point2 = oc.BRep_Tool.Pnt(vertices[2]);
			const circle3Points = new oc.GC_MakeArcOfCircle_4(point0, point1, point2);
			const curve = circle3Points.Value().get();
			const edge = cadEdgeCreate(oc, curve);
			this.setCADShape(edge);
		} else {
			this.setCADObjects([]);
		}
	}
}
