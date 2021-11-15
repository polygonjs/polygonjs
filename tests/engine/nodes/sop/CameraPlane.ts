import {PerspectiveCameraObjNode} from '../../../../src/engine/nodes/obj/PerspectiveCamera';
import {CameraPlaneSopNode} from '../../../../src/engine/nodes/sop/CameraPlane';

async function prepareCamera(camera: PerspectiveCameraObjNode) {
	camera.p.t.set([0, 8, 0]);
	camera.p.r.set([-45, 0, 0]);
	await waitForCameraUpdated(camera);

	return camera;
}
async function waitForCameraUpdated(camera: PerspectiveCameraObjNode) {
	await camera.compute();
	camera.object.updateMatrix();
	camera.object.updateMatrixWorld(true);
	camera.object.updateWorldMatrix(true, true);
	camera.object.updateProjectionMatrix();
}
function createCameraPlane(camera: PerspectiveCameraObjNode) {
	const geo1 = window.geo1;
	const cameraPlane1 = geo1.createNode('cameraPlane');
	cameraPlane1.p.camera.setNode(camera);
	return cameraPlane1;
}
async function getBbox(cameraPlane1: CameraPlaneSopNode) {
	const container = await cameraPlane1.compute();
	const core_group = container.coreContent()!;
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	geometry.computeBoundingBox();
	return geometry.boundingBox!;
}

QUnit.test('cameraPlane simple', async (assert) => {
	const scene = window.scene;
	const camera = scene.createNode('perspectiveCamera');
	await prepareCamera(camera);
	const cameraPlane1 = createCameraPlane(camera);
	cameraPlane1.flags.display.set(true);

	let bbox = await getBbox(cameraPlane1);
	assert.in_delta(bbox.min.x, -9.88, 0.1);
	assert.in_delta(bbox.max.x, 9.88, 0.1);
	assert.in_delta(bbox.min.y, 0, 0.1);
	assert.in_delta(bbox.max.y, 0, 0.1);
	assert.in_delta(bbox.min.z, -22.5, 0.1);
	assert.in_delta(bbox.max.z, -2.4, 0.1);
});
