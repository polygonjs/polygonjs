import {
	BoxBufferGeometry,
	Mesh,
	ShaderMaterial
} from 'three';

export class Sky extends Mesh {

	constructor();

	geometry: BoxBufferGeometry;
	material: ShaderMaterial;

	static SkyShader: object;

}
