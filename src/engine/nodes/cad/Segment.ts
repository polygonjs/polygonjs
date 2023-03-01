/**
 * Creates a segment
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

class SegmentCadParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SegmentCadParamsConfig();

export class SegmentCadNode extends TypedCadNode<SegmentCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'segment';
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
		if (vertices.length >= 2) {
			const oc = await CadLoader.core();
			const point0 = oc.BRep_Tool.Pnt(vertices[0]);
			const point1 = oc.BRep_Tool.Pnt(vertices[1]);
			const segment = new oc.GC_MakeSegment_1(point0, point1);
			console.log(point0.Y(), point1.Y());
			const curve = segment.Value().get();
			const edge = cadEdgeCreate(oc, curve);
			console.log({curve, edge});
			this.setEdge(edge);
			// this.setGeomCurve(curve);
		} else {
			this.setCadObjects([]);
		}
	}
}
