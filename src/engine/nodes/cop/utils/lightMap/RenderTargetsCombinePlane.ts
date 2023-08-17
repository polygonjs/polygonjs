import {Mesh, PlaneGeometry} from 'three';
import {createRenderTargetsCombineMaterial} from './RenderTargetsCombineMaterial';

export function createRenderTargetsCombinePlane() {
	const mat = createRenderTargetsCombineMaterial();

	const plane = new Mesh(new PlaneGeometry(1, 1), mat);
	plane.name = 'RenderTargetsCombine Plane';
	plane.frustumCulled = false;
	plane.renderOrder = 0;
	mat.depthWrite = false;
	return {plane, mat};
}
