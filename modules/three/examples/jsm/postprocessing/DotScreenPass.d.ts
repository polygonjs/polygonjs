import {
	Vector2,
	ShaderMaterial
} from 'three';

import { Pass } from 'three';

export class DotScreenPass extends Pass {

	constructor( center?: Vector2, angle?: number, scale?: number );
	uniforms: object;
	material: ShaderMaterial;
	fsQuad: object;

}
