/**
 * Creates a rectangle.
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import type {OpenCascadeInstance} from '../../../core/geometry/cad/CadCommon';
import {withCadException} from '../../../core/geometry/cad/CadExceptionHandler';

// TODO: make by default on the same axis as other 3d curve primitives like cad/circle
const FILLET_RADIUS_SAFETY_MARGIN = 0.01;
class RectangleCadParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new RectangleCadParamsConfig();

export class RectangleCadNode extends TypedCadNode<RectangleCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'rectangle';
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const w = this.pv.size.x;
		const h = this.pv.size.y;
		const minDim = Math.min(w, h);
		const r = Math.min(this.pv.filletRadius, minDim / 2 - FILLET_RADIUS_SAFETY_MARGIN);
		const x = w / 2 - r;
		const y = h / 2 - r;

		withCadException(oc, () => {
			const arc0 = _createArc(oc, x, -y, r, (3 * Math.PI) / 2);
			const arc1 = _createArc(oc, x, y, r, 0);
			const arc2 = _createArc(oc, -x, y, r, (1 * Math.PI) / 2);
			const arc3 = _createArc(oc, -x, -y, r, Math.PI);

			const edges = new oc.TopTools_Array1OfShape_2(1, 8);
			const vertices = new oc.TopTools_Array1OfShape_2(1, 8);

			// add edges to list
			edges.SetValue(2, arc0.edge);
			edges.SetValue(4, arc1.edge);
			edges.SetValue(6, arc2.edge);
			edges.SetValue(8, arc3.edge);

			// add vertices to list
			vertices.SetValue(2, arc0.vertex1);
			vertices.SetValue(3, arc0.vertex2);
			vertices.SetValue(4, arc1.vertex1);
			vertices.SetValue(5, arc1.vertex2);
			vertices.SetValue(6, arc2.vertex1);
			vertices.SetValue(7, arc2.vertex2);
			vertices.SetValue(8, arc3.vertex1);
			vertices.SetValue(1, arc3.vertex2);

			for (let i = 1; i <= 7; i += 2) {
				const startVertex = oc.TopoDS.Vertex_2(vertices.Value(i));
				const endVertex = oc.TopoDS.Vertex_2(vertices.Value(i + 1));
				const api = new oc.BRepBuilderAPI_MakeEdge_2(startVertex, endVertex);
				// if (!api.IsDone()) {
				// 	console.warn('not done 2');
				// } else {
				// 	console.log('ok 2');
				// }
				const edge = api.Edge();
				edges.SetValue(i, edge);
			}

			// create wire
			const api = new oc.BRepBuilderAPI_MakeWire_1();
			for (let i = 1; i <= 8; i++) {
				api.Add_1(oc.TopoDS.Edge_2(edges.Value(i)));
			}
			// if (!api.IsDone()) {
			// 	console.warn('not done 3');
			// } else {
			// 	console.log('ok 3');
			// }
			const wire = api.Wire();
			this.setWire(wire);
		});
	}
}

function _createArc(oc: OpenCascadeInstance, x: number, y: number, radius: number, angleStart: number) {
	const origin = new oc.gp_Ax2_1();
	const offset = new oc.gp_Vec_4(x, y, 0);
	origin.Translate_1(offset);
	const circle = new oc.gp_Circ_2(origin, radius);
	const api = new oc.BRepBuilderAPI_MakeEdge_9(circle, angleStart, angleStart + Math.PI / 2);

	// if (!api.IsDone()) {
	// 	console.warn('not done');
	// } else {
	// 	console.log('ok');
	// }

	const edge = api.Edge();
	return {
		edge,
		vertex1: api.Vertex1(),
		vertex2: api.Vertex2(),
	};
}
