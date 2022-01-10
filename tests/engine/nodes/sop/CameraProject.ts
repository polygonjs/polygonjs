import {CoreSleep} from '../../../../src/core/Sleep';
import {CameraProjectSopNode} from '../../../../src/engine/nodes/sop/CameraProject';

async function createCamera() {
	const scene = window.scene;
	const camera = scene.createNode('perspectiveCamera');
	camera.p.near.set(1);
	camera.p.far.set(10);
	await camera.compute();
	await CoreSleep.sleep(500);
	// camera.p.t.set([0, 0, 5]);
	// camera.p.r.set([0, 45, 0]);
	// camera.p.near.set(1);
	// camera.p.far.set(10);
	camera.object.position.set(0, 0, 5);
	// camera.object.near = 1;
	// camera.object.far = 10;
	camera.object.updateProjectionMatrix();
	camera.object.updateMatrix();
	camera.object.updateMatrixWorld(true);
	camera.object.updateWorldMatrix(true, true);

	return camera;
}
async function createCameraProject(assert: Assert) {
	const camera = await createCamera();
	assert.equal(camera.object.near, 1);
	assert.equal(camera.object.far, 10);

	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const bboxScatter1 = geo1.createNode('bboxScatter');
	const cameraProject1 = geo1.createNode('cameraProject');
	box1.p.center.set([0, 0, 0]);
	box1.p.size.set(2);
	bboxScatter1.setInput(0, box1);
	cameraProject1.setInput(0, bboxScatter1);
	cameraProject1.p.camera.setNode(camera);
	return cameraProject1;
}
async function getBbox(cameraProject1: CameraProjectSopNode) {
	const container = await cameraProject1.compute();
	const core_group = container.coreContent()!;
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	geometry.computeBoundingBox();
	return geometry.boundingBox!;
}

QUnit.test('cameraProject simple', async (assert) => {
	const cameraProject1 = await createCameraProject(assert);

	let bbox = await getBbox(cameraProject1);

	assert.in_delta(bbox.min.x, -0.53, 0.1);
	assert.in_delta(bbox.max.x, 0.53, 0.1);
	assert.in_delta(bbox.min.y, -0.53, 0.1);
	assert.in_delta(bbox.max.y, 0.53, 0.1);
	assert.in_delta(bbox.min.z, 0.51, 0.1);
	assert.in_delta(bbox.max.z, 0.68, 0.1);
});

QUnit.test('cameraProject unproject', async (assert) => {
	const cameraProject1 = await createCameraProject(assert);

	let bbox = await getBbox(cameraProject1);
	assert.in_delta(bbox.min.x, -0.53, 0.1);
	assert.in_delta(bbox.max.x, 0.53, 0.1);
	assert.in_delta(bbox.min.y, -0.53, 0.1);
	assert.in_delta(bbox.max.y, 0.53, 0.1);
	assert.in_delta(bbox.min.z, 0.61, 0.1);
	assert.in_delta(bbox.max.z, 0.68, 0.1);
});
