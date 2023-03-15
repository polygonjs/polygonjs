import type {ManifoldStatic, Manifold, Mesh} from './manifold/manifold';
export type {ManifoldStatic, Manifold, Mesh};
import {Color} from 'three';

export type SDFGeometry = Manifold;

export enum SDFObjectType {
	DEFAULT = 'SDFManifold',
}

const SDF_OBJECT_TYPES: SDFObjectType[] = [SDFObjectType.DEFAULT];
export const SDF_OBJECT_TYPES_SET: Set<SDFObjectType> = new Set(SDF_OBJECT_TYPES);

export interface SDFTesselationParams {
	facetAngle: number;
	meshesColor: Color;
	wireframe: boolean;
}
export interface SDFOBJTesselationParams {
	SDFFacetAngle: number;
	SDFMeshesColor: Color;
	SDFWireframe: boolean;
}
