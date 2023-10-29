import {PolyScene} from '../../../../src/engine/scene/PolyScene';
export function coreGetDefaultCamera(scene: PolyScene) {
	return (
		scene.root().mainCameraController.cameraSync() ||
		scene.viewersRegister.lastRenderedViewer()?.camera() ||
		scene.root().mainCameraController.dummyPerspectiveCamera()
	);
}
