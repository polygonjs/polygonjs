import type {OpenCascadeInstance, TopoDS_Shape, TopoDS_Face, TopoDS_Edge,TopoDS_Vertex} from './CadCommon';

export function traverseFaces(
	oc: OpenCascadeInstance,
	shape: TopoDS_Shape,
	callback: (face: TopoDS_Face, index: number) => void
): void {
	let index = 0;
	const explorer = new oc.TopExp_Explorer_2(
		shape,
		oc.TopAbs_ShapeEnum.TopAbs_FACE as any,
		oc.TopAbs_ShapeEnum.TopAbs_SHAPE as any
	);

	while (explorer.More()) {
		const explorerCurrent = explorer.Current();
		const face = oc.TopoDS.Face_1(explorerCurrent);
		callback(face, index);
		// face.delete();
		index += 1;
		explorer.Next();
	}
	explorer.delete();
}
export function traverseEdges(
	oc: OpenCascadeInstance,
	shape: TopoDS_Shape,
	callback: (edge: TopoDS_Edge, index: number) => void
): void {
	let index = 0;
	const explorer = new oc.TopExp_Explorer_2(
		shape,
		oc.TopAbs_ShapeEnum.TopAbs_EDGE as any,
		oc.TopAbs_ShapeEnum.TopAbs_SHAPE as any
	);
	while (explorer.More()) {
		const edge = oc.TopoDS.Edge_1(explorer.Current());
		callback(edge, index);
		index += 1;
		explorer.Next();
	}
	explorer.delete();
}
export function traverseVertices(
	oc: OpenCascadeInstance,
	shape: TopoDS_Shape,
	callback: (edge: TopoDS_Vertex, index: number) => void
): void {
	let index = 0;
	const explorer = new oc.TopExp_Explorer_2(
		shape,
		oc.TopAbs_ShapeEnum.TopAbs_VERTEX as any,
		oc.TopAbs_ShapeEnum.TopAbs_SHAPE as any
	);
	while (explorer.More()) {
		const vertex = oc.TopoDS.Vertex_1(explorer.Current());
		callback(vertex, index);
		index += 1;
		explorer.Next();
	}
	explorer.delete();
}
