import {Raycaster} from 'three';
import {ThreeMeshBVHHelper} from './geometry/bvh/ThreeMeshBVHHelper';

export function createRaycaster() {
	const raycaster = new Raycaster();
	ThreeMeshBVHHelper.updateRaycaster(raycaster);
	return raycaster;
}
