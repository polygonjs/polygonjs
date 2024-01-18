// import type {ManifoldStatic, Manifold, Mesh} from 'manifold-3d';
// import Module from 'manifold-3d';
import type {ManifoldToplevel, Manifold, Mesh, Mat4, Smoothness, Box} from './manifold/manifold';
import Module from './manifold/manifold';
export type {ManifoldToplevel, Manifold, Mesh, Mat4, Smoothness, Box};
export {Module};
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
