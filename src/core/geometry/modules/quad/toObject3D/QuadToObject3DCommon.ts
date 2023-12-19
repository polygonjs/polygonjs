import {Object3D} from 'three';

export interface PrepareObjectOptions {
	shadow: boolean;
}
export function prepareObject(object3D: Object3D, options: PrepareObjectOptions): void {
	object3D.matrixAutoUpdate = false;
	object3D.updateMatrix();
	object3D.castShadow = options.shadow;
	object3D.receiveShadow = options.shadow;
}
