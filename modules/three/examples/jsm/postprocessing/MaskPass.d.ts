import {
	Scene,
	Camera,
} from 'three';

import { Pass } from 'three';

export class MaskPass extends Pass {

	constructor( scene: Scene, camera: Camera );
	scene: Scene;
	camera: Camera;
	inverse: boolean;

}

export class ClearMaskPass extends Pass {

	constructor();

}
