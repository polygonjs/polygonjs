import {
	ShaderMaterial
} from 'three';

import { Pass } from 'three';

export class FilmPass extends Pass {

	constructor( noiseIntensity?: number, scanlinesIntensity?: number, scanlinesCount?: number, grayscale?: number );
	uniforms: object;
	material: ShaderMaterial;
	fsQuad: object;

}
