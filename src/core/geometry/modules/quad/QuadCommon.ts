export enum QUADObjectType {
	DEFAULT = 'Quad',
}

const QUAD_OBJECT_TYPES: QUADObjectType[] = [QUADObjectType.DEFAULT];
export const QUAD_OBJECT_TYPES_SET: Set<QUADObjectType> = new Set(QUAD_OBJECT_TYPES);

export interface QUADTesselationParams {
	triangles: boolean;
	wireframe: boolean;
	center: boolean;
	innerRadius: boolean;
	outerRadius: boolean;
}
export interface QUADOBJTesselationParams {
	QUADTriangles: boolean;
	QUADWireframe: boolean;
	QUADCenter: boolean;
	QUADInnerRadius: boolean;
	QUADOuterRadius: boolean;
}
export enum QuadTriangulationAttribute {
	INNER_RADIUS = 'innerRadius',
	OUTER_RADIUS = 'outerRadius',
}
