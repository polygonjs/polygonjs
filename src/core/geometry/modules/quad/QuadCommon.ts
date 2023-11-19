import {Color} from 'three';

export enum QUADObjectType {
	DEFAULT = 'Quad',
}

const QUAD_OBJECT_TYPES: QUADObjectType[] = [QUADObjectType.DEFAULT];
export const QUAD_OBJECT_TYPES_SET: Set<QUADObjectType> = new Set(QUAD_OBJECT_TYPES);

export interface QUADTesselationParams {
	triangles: boolean;
	splitQuads:boolean
	wireframe: boolean;
	wireframeColor: Color;
	center: boolean;
	innerRadius: boolean;
	outerRadius: boolean;
	pointAttributes: string;
	primitiveAttributes: string;
}
export interface QUADOBJTesselationParams {
	QUADTriangles: boolean;
	QUADSplitQuads:boolean
	QUADWireframe: boolean;
	QUADWireframeColor: Color;
	QUADCenter: boolean;
	QUADInnerRadius: boolean;
	QUADOuterRadius: boolean;
	QUADPointAttributes: string;
	QUADPrimitiveAttributes: string;
}
export enum QuadTriangulationAttribute {
	INNER_RADIUS = 'innerRadius',
	OUTER_RADIUS = 'outerRadius',
}
