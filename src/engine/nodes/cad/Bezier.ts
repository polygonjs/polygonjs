/**
 * Creates a 3D bezier.
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {TopoDS_Shape} from '../../../core/geometry/cad/CadCommon';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';

class BezierCadParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BezierCadParamsConfig();

export class BezierCadNode extends TypedCadNode<BezierCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'bezier';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const objects = inputCoreGroups[0].objects();

		const vertices: TopoDS_Shape[] = [];
		for (let object of objects) {
			if (CoreCadType.isVertex(object)) {
				vertices.push(object.object());
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

			const bezier = new oc.Geom_BezierCurve_1(positions);
			const edge = cadEdgeCreate(oc, bezier);
			this.setEdge(edge);
		} else {
			this.setCadObjects([]);
		}
	}
}
