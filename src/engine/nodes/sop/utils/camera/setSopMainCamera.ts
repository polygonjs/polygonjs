import type {PerspectiveCameraSopNode} from '../../PerspectiveCamera';
import type {OrthographicCameraSopNode} from '../../OrthographicCamera';

type SopCameraNode = PerspectiveCameraSopNode | OrthographicCameraSopNode;

export async function setSopMainCamera(node: SopCameraNode) {
	const container = await node.compute();
	const objects = container.coreContent()?.objects();
	if (!objects) {
		return;
	}
	const object = objects[0];
	if (!object) {
		return;
	}
	const scene = node.scene();
	// if the node has computed and is displayed,
	// the object will have a full path,
	// and we can therefore set the main camera path from it.
	// But if it it not yet attached, we must use a mask, which may not be ideal.
	// so at the moment, we raise an error instead.
	if (object.parent) {
		const path = scene.objectsController.objectPath(object);
		scene.camerasController.setMainCameraPath(path);
	} else {
		alert(
			'the camera object is not part of the scene yet. Make sure to set the display flag on before setting this as the main camera.'
		);
	}
}
