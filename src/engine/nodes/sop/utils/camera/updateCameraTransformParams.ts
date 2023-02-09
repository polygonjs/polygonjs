import type {PerspectiveCameraSopNode} from '../../PerspectiveCamera';
import type {OrthographicCameraSopNode} from '../../OrthographicCamera';
import {Number3} from '../../../../../types/GlobalTypes';
import {MathUtils} from 'three';

type SopCameraNode = PerspectiveCameraSopNode | OrthographicCameraSopNode;

const eulerArray: Number3 = [0, 0, 0];
export async function updateCameraTransformParams(node: SopCameraNode) {
	const cameraName = node.p.name.value;
	const mask = `*/${cameraName}`;
	const object = node.scene().objectsController.findObjectByMask(mask);
	if (!object) {
		return;
	}
	node.p.position.set(object.position.toArray());
	object.rotation.toArray(eulerArray);
	eulerArray.forEach((e, i) => (eulerArray[i] = MathUtils.radToDeg(e)));
	node.p.rotation.set(eulerArray);
}
