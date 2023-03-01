/**
 * Creates an arc from 3 points.
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import type {TopoDS_Vertex} from '../../../core/geometry/cad/CadCommon';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';

class Circle3PointsCadParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new Circle3PointsCadParamsConfig();

export class Circle3PointsCadNode extends TypedCadNode<Circle3PointsCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'circle3Points';
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const objects = inputCoreGroups[0].objects();

		const vertices: TopoDS_Vertex[] = [];
		for (let object of objects) {
			if (CoreCadType.isVertex(object)) {
				vertices.push(object.object());
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
			this.setEdge(edge);
		} else {
			this.setCadObjects([]);
		}
	}
}
