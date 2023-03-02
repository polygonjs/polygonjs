/**
 * Creates a segment
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import type {TopoDS_Vertex, OpenCascadeInstance, gp_Pnt2d} from '../../../core/geometry/cad/CadCommon';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';
import {CadObjectType} from '../../../core/geometry/cad/CadCommon';
import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';

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
		const oc = await CadLoader.core();
		const inputObjects = inputCoreGroups[0].objects();

		const newObjects: CadCoreObject<CadObjectType>[] = [];

		let previousPoint2DObject: CadCoreObject<CadObjectType.POINT_2D> | undefined;
		let previousVertexObject: CadCoreObject<CadObjectType.VERTEX> | undefined;
		for (let inputObject of inputObjects) {
			if (CoreCadType.isVertex(inputObject)) {
				if (previousVertexObject) {
					newObjects.push(this._createSegment(oc, previousVertexObject.object(), inputObject.object()));
				}
				previousVertexObject = inputObject;
			} else if (CoreCadType.isPoint2d(inputObject)) {
				if (previousPoint2DObject) {
					newObjects.push(this._createSegment2d(oc, previousPoint2DObject.object(), inputObject.object()));
				}
				previousPoint2DObject = inputObject;
			}
		}

		this.setCadObjects(newObjects);
	}
	private _createSegment(oc: OpenCascadeInstance, vertex0: TopoDS_Vertex, vertex1: TopoDS_Vertex) {
		const point0 = oc.BRep_Tool.Pnt(vertex0);
		const point1 = oc.BRep_Tool.Pnt(vertex1);
		const segment = new oc.GC_MakeSegment_1(point0, point1);
		const curve = segment.Value().get();
		const edge = cadEdgeCreate(oc, curve);

		this.setEdge(edge);
		return new CadCoreObject(edge, CadObjectType.EDGE);
	}
	private _createSegment2d(oc: OpenCascadeInstance, point0: gp_Pnt2d, point1: gp_Pnt2d) {
		const segment = new oc.GCE2d_MakeSegment_1(point0, point1);
		const curve = segment.Value().get();
		return new CadCoreObject(curve, CadObjectType.CURVE_2D);
	}
}
