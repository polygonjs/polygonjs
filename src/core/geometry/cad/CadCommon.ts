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
	Bnd_Box,
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
	Bnd_Box,
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

export type CadGeometry =
	| gp_Pnt2d
	| Geom2d_Curve
	// Geom_Curve |
	| TopoDS_Vertex
	| TopoDS_Edge
	| TopoDS_Wire
	| TopoDS_Shape;

export enum CadGeometryType {
	POINT_2D = 'CADPoint2D',
	CURVE_2D = 'CADCurve2D',
	// CURVE_3D = 'curve3D',
	VERTEX = 'CADVertex',
	EDGE = 'CADEdge',
	WIRE = 'CADWire',
	FACE = 'CADFace',
	SHELL = 'CADShell',
	SOLID = 'CADSolid',
	COMPSOLID = 'CADCompsolid',
	COMPOUND = 'CADCompound',
}
const CAD_GEOMETRY_TYPES: CadGeometryType[] = [
	CadGeometryType.POINT_2D,
	CadGeometryType.CURVE_2D,
	CadGeometryType.VERTEX,
	CadGeometryType.EDGE,
	CadGeometryType.WIRE,
	CadGeometryType.FACE,
	CadGeometryType.SHELL,
	CadGeometryType.SOLID,
	CadGeometryType.COMPSOLID,
	CadGeometryType.COMPOUND,
];
export const CAD_GEOMETRY_TYPES_SET: Set<CadGeometryType> = new Set(CAD_GEOMETRY_TYPES);
export type CadGeometryTypeShape =
	| CadGeometryType.VERTEX
	| CadGeometryType.EDGE
	| CadGeometryType.WIRE
	| CadGeometryType.FACE
	| CadGeometryType.SHELL
	| CadGeometryType.SOLID
	| CadGeometryType.COMPSOLID
	| CadGeometryType.COMPOUND;
export const CAD_GEOMETRY_TYPES_SHAPE: CadGeometryTypeShape[] = [
	CadGeometryType.VERTEX,
	CadGeometryType.EDGE,
	CadGeometryType.WIRE,
	CadGeometryType.FACE,
	CadGeometryType.SHELL,
	CadGeometryType.SOLID,
	CadGeometryType.COMPSOLID,
	CadGeometryType.COMPOUND,
];
export const CAD_GEOMETRY_TYPES_SET_SHAPE: Set<CadGeometryType> = new Set(CAD_GEOMETRY_TYPES_SHAPE);

function _createShapeTypeToCadGeometryTypeMap(oc: OpenCascadeInstance): Map<TopAbs_ShapeEnum, CadGeometryTypeShape> {
	const shapeEnum = oc.TopAbs_ShapeEnum;
	const map = new Map([
		[shapeEnum.TopAbs_VERTEX, CadGeometryType.VERTEX],
		[shapeEnum.TopAbs_EDGE, CadGeometryType.EDGE],
		[shapeEnum.TopAbs_WIRE, CadGeometryType.WIRE],
		[shapeEnum.TopAbs_FACE, CadGeometryType.FACE],
		[shapeEnum.TopAbs_SHELL, CadGeometryType.SHELL],
		[shapeEnum.TopAbs_SOLID, CadGeometryType.SOLID],
		[shapeEnum.TopAbs_COMPSOLID, CadGeometryType.COMPSOLID],
		[shapeEnum.TopAbs_COMPOUND, CadGeometryType.COMPOUND],
	]);
	return map as Map<TopAbs_ShapeEnum, CadGeometryTypeShape>;
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
function _createCastMapFromCadGeometryTypeMap(oc: OpenCascadeInstance): Map<TopAbs_ShapeEnum, ShapeCaster> {
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
let shapeTypeToCadGeometryTypeMap: Map<TopAbs_ShapeEnum, CadGeometryType> | undefined;
let shapeCasterByCadGeometryTypeMap: Map<TopAbs_ShapeEnum, ShapeCaster> | undefined;
export function cadGeometryTypeFromShape(oc: OpenCascadeInstance, shape: TopoDS_Shape) {
	shapeTypeToCadGeometryTypeMap = shapeTypeToCadGeometryTypeMap || _createShapeTypeToCadGeometryTypeMap(oc);
	return shapeTypeToCadGeometryTypeMap.get(shape.ShapeType());
}
export function cadDowncast(oc: OpenCascadeInstance, shape: TopoDS_Shape) {
	shapeCasterByCadGeometryTypeMap = shapeCasterByCadGeometryTypeMap || _createCastMapFromCadGeometryTypeMap(oc);
	const caster = shapeCasterByCadGeometryTypeMap.get(shape.ShapeType())!;
	return caster(shape);
}

export interface CadTypeMap {
	[CadGeometryType.POINT_2D]: gp_Pnt2d;
	[CadGeometryType.CURVE_2D]: Geom2d_Curve;
	// [CadObjectType.CURVE_3D]: Geom_Curve;
	[CadGeometryType.VERTEX]: TopoDS_Vertex;
	[CadGeometryType.EDGE]: TopoDS_Edge;
	[CadGeometryType.WIRE]: TopoDS_Wire;
	[CadGeometryType.FACE]: TopoDS_Face;
	[CadGeometryType.SHELL]: TopoDS_Shell;
	[CadGeometryType.SOLID]: TopoDS_Solid;
	[CadGeometryType.COMPSOLID]: TopoDS_CompSolid;
	[CadGeometryType.COMPOUND]: TopoDS_Compound;
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
	type: CadGeometryType;
}
export interface CadNumberHandle {
	current: number;
}
export const _createCadNumberHandle: () => CadNumberHandle = () => ({current: 0});
export interface CadVector3Handle {
	x: CadNumberHandle;
	y: CadNumberHandle;
	z: CadNumberHandle;
}
export const _createCadVector3Handle: () => CadVector3Handle = () => ({
	x: _createCadNumberHandle(),
	y: _createCadNumberHandle(),
	z: _createCadNumberHandle(),
});

export interface CadBox3Handle {
	min: CadVector3Handle;
	max: CadVector3Handle;
}
export const _createCadBox3Handle: () => CadBox3Handle = () => ({
	min: _createCadVector3Handle(),
	max: _createCadVector3Handle(),
});
