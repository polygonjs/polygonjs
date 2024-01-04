import {Color} from 'three';

export enum QUADObjectType {
	DEFAULT = 'Quad',
}

const QUAD_OBJECT_TYPES: QUADObjectType[] = [QUADObjectType.DEFAULT];
export const QUAD_OBJECT_TYPES_SET: Set<QUADObjectType> = new Set(QUAD_OBJECT_TYPES);

export interface QUADTesselationParams {
	triangles: boolean;
	wireframe: boolean;
	unsharedEdges: boolean;
	wireframeColor: Color;
	center: boolean;
	innerRadius: boolean;
	outerRadius: boolean;
	edgeCenterVectors: boolean;
	splitQuads: boolean;
	pointAttributes: string;
	primitiveAttributes: string;
}
export interface QUADOBJTesselationParams {
	QUADTriangles: boolean;
	QUADWireframe: boolean;
	QUADUnsharedEdges: boolean;
	QUADWireframeColor: Color;
	QUADCenter: boolean;
	QUADInnerRadius: boolean;
	QUADOuterRadius: boolean;
	QUADEdgeCenterVectors: boolean;
	QUADSplitQuads: boolean;
	QUADPointAttributes: string;
	QUADPrimitiveAttributes: string;
}
export enum QuadTriangulationAttribute {
	INNER_RADIUS = 'innerRadius',
	OUTER_RADIUS = 'outerRadius',
	EDGE_CENTER_VECTOR = 'edgeCenterVector',
}
