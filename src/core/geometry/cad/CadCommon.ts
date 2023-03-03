import {Color} from 'three';

import type {
	OpenCascadeInstance,
	TopoDS_Shape,
	TopoDS_Vertex,
	TopoDS_Edge,
	TopoDS_Wire,
	TopoDS_Face,
	TopoDS_Shell,
	TopoDS_Solid,
	TopoDS_CompSolid,
	TopoDS_Compound,
	Geom2d_Curve,
	Geom_Curve,
	BRepMesh_IncrementalMesh,
	gp_Pln,
	gp_Pnt2d,
	gp_Pnt,
	gp_Quaternion,
	gp_Vec2d,
	gp_Vec,
	gp_Trsf,
	gp_Ax1,
	gp_Ax2,
	gp_Dir,
	gp_XYZ,
	TopAbs_ShapeEnum,
} from 'opencascade.js';
export type {
	OpenCascadeInstance,
	BRepMesh_IncrementalMesh,
	TopoDS_Shape,
	TopoDS_Vertex,
	TopoDS_Face,
	TopoDS_Shell,
	TopoDS_Solid,
	TopoDS_CompSolid,
	TopoDS_Compound,
	TopoDS_Edge,
	TopoDS_Wire,
	Geom2d_Curve,
	Geom_Curve,
	gp_Pln,
	gp_Pnt2d,
	gp_Pnt,
	gp_Quaternion,
	gp_Vec2d,
	gp_Vec,
	gp_Trsf,
	gp_Ax1,
	gp_Ax2,
	gp_Dir,
	gp_XYZ,
};

export type CadObject =
	| gp_Pnt2d
	| Geom2d_Curve
	// Geom_Curve |
	| TopoDS_Vertex
	| TopoDS_Edge
	| TopoDS_Wire
	| TopoDS_Shape;

export enum CadObjectType {
	POINT_2D = 'point2D',
	CURVE_2D = 'curve2D',
	// CURVE_3D = 'curve3D',
	VERTEX = 'vertex',
	EDGE = 'edge',
	WIRE = 'wire',
	FACE = 'face',
	SHELL = 'shell',
	SOLID = 'solid',
	COMPSOLID = 'compsolid',
	COMPOUND = 'compound',
}
export type CadObjectTypeShape =
	| CadObjectType.VERTEX
	| CadObjectType.EDGE
	| CadObjectType.WIRE
	| CadObjectType.FACE
	| CadObjectType.SHELL
	| CadObjectType.SOLID
	| CadObjectType.COMPSOLID
	| CadObjectType.COMPOUND;
export const CAD_OBJECT_TYPES_SHAPE: CadObjectTypeShape[] = [
	CadObjectType.VERTEX,
	CadObjectType.EDGE,
	CadObjectType.WIRE,
	CadObjectType.FACE,
	CadObjectType.SHELL,
	CadObjectType.SOLID,
	CadObjectType.COMPSOLID,
	CadObjectType.COMPOUND,
];
export const CAD_OBJECT_TYPES_SET_SHAPE: Set<CadObjectTypeShape> = new Set(CAD_OBJECT_TYPES_SHAPE);

function _createShapeTypeToCadObjectTypeMap(oc: OpenCascadeInstance): Map<TopAbs_ShapeEnum, CadObjectTypeShape> {
	const shapeEnum = oc.TopAbs_ShapeEnum;
	const map = new Map([
		[shapeEnum.TopAbs_VERTEX, CadObjectType.VERTEX],
		[shapeEnum.TopAbs_EDGE, CadObjectType.EDGE],
		[shapeEnum.TopAbs_WIRE, CadObjectType.WIRE],
		[shapeEnum.TopAbs_FACE, CadObjectType.FACE],
		[shapeEnum.TopAbs_SHELL, CadObjectType.SHELL],
		[shapeEnum.TopAbs_SOLID, CadObjectType.SOLID],
		[shapeEnum.TopAbs_COMPSOLID, CadObjectType.COMPSOLID],
		[shapeEnum.TopAbs_COMPOUND, CadObjectType.COMPOUND],
	]);
	return map as Map<TopAbs_ShapeEnum, CadObjectTypeShape>;
}
export type CadShape =
	| TopoDS_Vertex
	| TopoDS_Edge
	| TopoDS_Wire
	| TopoDS_Face
	| TopoDS_Shell
	| TopoDS_Solid
	| TopoDS_CompSolid
	| TopoDS_Compound;
type ShapeCaster = (S: TopoDS_Shape) => CadShape;
function _createCastMapFromCadObjectTypeMap(oc: OpenCascadeInstance): Map<TopAbs_ShapeEnum, ShapeCaster> {
	const shapeEnum = oc.TopAbs_ShapeEnum;
	const map = new Map([
		[shapeEnum.TopAbs_VERTEX, oc.TopoDS.Vertex_1],
		[shapeEnum.TopAbs_EDGE, oc.TopoDS.Edge_1],
		[shapeEnum.TopAbs_WIRE, oc.TopoDS.Wire_1],
		[shapeEnum.TopAbs_FACE, oc.TopoDS.Face_1],
		[shapeEnum.TopAbs_SHELL, oc.TopoDS.Shell_1],
		[shapeEnum.TopAbs_SOLID, oc.TopoDS.Solid_1],
		[shapeEnum.TopAbs_COMPSOLID, oc.TopoDS.CompSolid_1],
		[shapeEnum.TopAbs_COMPOUND, oc.TopoDS.Compound_1],
	]);
	return map as Map<TopAbs_ShapeEnum, ShapeCaster>;
}
let shapeTypeToCadObjectTypeMap: Map<TopAbs_ShapeEnum, CadObjectType> | undefined;
let shapeCasterByCadObjectTypeMap: Map<TopAbs_ShapeEnum, ShapeCaster> | undefined;
export function cadObjectTypeFromShape(oc: OpenCascadeInstance, shape: TopoDS_Shape) {
	shapeTypeToCadObjectTypeMap = shapeTypeToCadObjectTypeMap || _createShapeTypeToCadObjectTypeMap(oc);
	return shapeTypeToCadObjectTypeMap.get(shape.ShapeType());
}
export function cadDowncast(oc: OpenCascadeInstance, shape: TopoDS_Shape) {
	shapeCasterByCadObjectTypeMap = shapeCasterByCadObjectTypeMap || _createCastMapFromCadObjectTypeMap(oc);
	const caster = shapeCasterByCadObjectTypeMap.get(shape.ShapeType())!;
	return caster(shape);
}

export interface CadTypeMap {
	[CadObjectType.POINT_2D]: gp_Pnt2d;
	[CadObjectType.CURVE_2D]: Geom2d_Curve;
	// [CadObjectType.CURVE_3D]: Geom_Curve;
	[CadObjectType.VERTEX]: TopoDS_Vertex;
	[CadObjectType.EDGE]: TopoDS_Edge;
	[CadObjectType.WIRE]: TopoDS_Wire;
	[CadObjectType.FACE]: TopoDS_Face;
	[CadObjectType.SHELL]: TopoDS_Shell;
	[CadObjectType.SOLID]: TopoDS_Solid;
	[CadObjectType.COMPSOLID]: TopoDS_CompSolid;
	[CadObjectType.COMPOUND]: TopoDS_Compound;
}
export interface CachedTesselationParams {
	linearTolerance: number;
	angularTolerance: number;
	curveAbscissa: number;
	curveTolerance: number;
}

export interface TesselationParams extends CachedTesselationParams {
	wireframe: boolean;
	displayMeshes: boolean;
	displayEdges: boolean;
	meshesColor: Color;
	edgesColor: Color;
}

export interface FaceData {
	positions: number[];
	normals: number[];
	indices: number[];
}
export interface EdgeData {
	positions: number[];
}
export interface CadObjectData {
	type: CadObjectType;
}
