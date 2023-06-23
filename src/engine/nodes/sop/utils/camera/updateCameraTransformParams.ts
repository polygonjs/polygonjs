import type {PerspectiveCameraSopNode} from '../../PerspectiveCamera';
import type {OrthographicCameraSopNode} from '../../OrthographicCamera';
import {Number3} from '../../../../../types/GlobalTypes';
import {MathUtils, Object3D} from 'three';
import {CoreObjectType} from '../../../../../core/geometry/ObjectContent';

type SopCameraNode = PerspectiveCameraSopNode | OrthographicCameraSopNode;

const eulerArray: Number3 = [0, 0, 0];
export async function updateCameraTransformParams(node: SopCameraNode) {
	const cameraName = node.p.name.value;
	const mask = `*/${cameraName}`;
	const object = node.scene().objectsController.findObjectByMask<CoreObjectType.THREEJS>(mask) as
		| Object3D
		| undefined;
	if (!object) {
		return;
	}
	node.p.position.set(object.position.toArray());
	object.rotation.toArray(eulerArray);
	eulerArray.forEach((e, i) => (eulerArray[i] = MathUtils.radToDeg(e)));
	node.p.rotation.set(eulerArray);
}
