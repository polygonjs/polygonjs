import {Mesh, PlaneGeometry} from 'three';
import {createBlurMaterial} from './BlurMaterial';

export function createBlurPlane() {
	const mat = createBlurMaterial();

	const plane = new Mesh(new PlaneGeometry(1, 1), mat);
	plane.name = 'Blurring Plane';
	plane.frustumCulled = false;
	plane.renderOrder = 0;
	mat.depthWrite = false;
	return {plane, mat};
}
