/**
 * Creates a rectangle.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {step} from '../../../core/geometry/cad/CadConstant';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import type {OpenCascadeInstance, GCRegisterFunction} from '../../../core/geometry/cad/CadCommon';
import {CadGC} from '../../../core/geometry/cad/CadCommon';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadLoaderSync} from '../../../core/geometry/cad/CadLoaderSync';

// TODO: make by default on the same axis as other 3d curve primitives like cad/circle
const FILLET_RADIUS_SAFETY_MARGIN = 0.01;
const HALF_PI = 0.5 * Math.PI;
class CADRectangleSopParamsConfig extends NodeParamsConfig {
	/** @param size */
	size = ParamConfig.VECTOR2([1, 1]);

	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param fillet radius */
	filletRadius = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, false],
		step,
	});
}
const ParamsConfig = new CADRectangleSopParamsConfig();

export class CADRectangleSopNode extends CADSopNode<CADRectangleSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_RECTANGLE;
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core(this);
		CadGC.withGC((r) => {
			const w = this.pv.size.x;
			const h = this.pv.size.y;
			const minDim = Math.min(w, h);
			const rad = Math.min(this.pv.filletRadius, minDim / 2 - FILLET_RADIUS_SAFETY_MARGIN);
			const x = w / 2 - rad;
			const z = h / 2 - rad;

			// withCadException(oc, () => {
			const arc0 = _createArc(oc, r, x, z, rad, 3);
			const arc1 = _createArc(oc, r, x, -z, rad, 0);
			const arc2 = _createArc(oc, r, -x, -z, rad, 1);
			const arc3 = _createArc(oc, r, -x, z, rad, 2);

			const edgesCount = 8;
			const linesCount = 4;
			const edges = r(new oc.TopTools_Array1OfShape_2(0, edgesCount - 1));
			const vertices = r(new oc.TopTools_Array1OfShape_2(0, 7));

			// add edges to list
			edges.SetValue(0, arc0.edge);
			edges.SetValue(2, arc1.edge);
			edges.SetValue(4, arc2.edge);
			edges.SetValue(6, arc3.edge);

			// add vertices to list
			vertices.SetValue(0, arc0.vertex1);
			vertices.SetValue(1, arc1.vertex0);
			vertices.SetValue(2, arc1.vertex1);
			vertices.SetValue(3, arc2.vertex0);
			vertices.SetValue(4, arc2.vertex1);
			vertices.SetValue(5, arc3.vertex0);
			vertices.SetValue(6, arc3.vertex1);
			vertices.SetValue(7, arc0.vertex0);

			for (let i = 0; i < linesCount; i += 1) {
				const startVertex = oc.TopoDS.Vertex_2(vertices.Value(i * 2));
				const endVertex = oc.TopoDS.Vertex_2(vertices.Value(i * 2 + 1));
				const edgeApi = r(new oc.BRepBuilderAPI_MakeEdge_2(startVertex, endVertex));
				const edge = edgeApi.Edge();

				edges.SetValue(i * 2 + 1, edge);
			}

			// create wire
			const wireApi = r(new oc.BRepBuilderAPI_MakeWire_1());
			for (let i = 0; i < edgesCount; i++) {
				wireApi.Add_1(oc.TopoDS.Edge_2(edges.Value(i)));
			}

			const wire = wireApi.Wire();
			this.setCADShape(wire);
		});
	}
}

function _createArc(
	oc: OpenCascadeInstance,
	r: GCRegisterFunction,
	x: number,
	z: number,
	radius: number,
	angleIncrement: number
) {
	const dir = CadLoaderSync.gp_Dir;
	dir.SetCoord_2(0, 1, 0);
	const axis = r(new oc.gp_Ax2_1());
	axis.SetDirection(dir);
	const offset = r(new oc.gp_Vec_4(x, 0, z));
	axis.Translate_1(offset);
	const circle = new oc.gp_Circ_2(axis, radius);
	const angleStart = angleIncrement * HALF_PI;
	const angleEnd = (angleIncrement + 1) * HALF_PI;
	const api = r(new oc.BRepBuilderAPI_MakeEdge_9(circle, angleStart, angleEnd));

	const edge = api.Edge();
	return {
		edge,
		vertex0: api.Vertex1(),
		vertex1: api.Vertex2(),
	};
}
