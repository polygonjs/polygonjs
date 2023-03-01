import type {OpenCascadeInstance, TopoDS_Shape, TopoDS_Face, TopoDS_Edge} from './CadCommon';

export function traverseFaces(
	oc: OpenCascadeInstance,
	shape: TopoDS_Shape,
	callback: (face: TopoDS_Face) => void
): void {
	// let itemsCount = 0;
	const explorer = new oc.TopExp_Explorer_2(
		shape,
		oc.TopAbs_ShapeEnum.TopAbs_FACE as any,
		oc.TopAbs_ShapeEnum.TopAbs_SHAPE as any
	);

	while (explorer.More()) {
		const explorerCurrent = explorer.Current();
		const face = oc.TopoDS.Face_1(explorerCurrent);
		callback(face);
		face.delete();
		// itemsCount += 1;
		explorer.Next();
	}
	explorer.delete();
	// return itemsCount;
}
export function traverseEdges(
	oc: OpenCascadeInstance,
	shape: TopoDS_Shape,
	callback: (edge: TopoDS_Edge) => void
): void {
	// let itemsCount = 0;
	const explorer = new oc.TopExp_Explorer_2(
		shape,
		oc.TopAbs_ShapeEnum.TopAbs_EDGE as any,
		oc.TopAbs_ShapeEnum.TopAbs_SHAPE as any
	);
	while (explorer.More()) {
		const edge = oc.TopoDS.Edge_1(explorer.Current());
		callback(edge);
		// itemsCount += 1;
		explorer.Next();
	}
	explorer.delete();
	// return itemsCount;
}
