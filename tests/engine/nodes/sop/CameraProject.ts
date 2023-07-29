import type {QUnit} from '../../../helpers/QUnit';
import {CameraProjectSopNode} from '../../../../src/engine/nodes/sop/CameraProject';
import {PerspectiveCameraSopNode} from '../../../../src/engine/nodes/sop/PerspectiveCamera';
export function testenginenodessopCameraProject(qUnit: QUnit) {

async function createCameraNode() {
	const geo1 = window.geo1;
	const camera = geo1.createNode('perspectiveCamera');
	camera.p.near.set(1);
	camera.p.far.set(10);
	camera.p.fov.set(100);

	return camera;
}
async function createCameraProject(cameraNode: PerspectiveCameraSopNode) {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const bboxScatter1 = geo1.createNode('bboxScatter');
	box1.p.sizes.set([0.5, 0.5, 0.4]);
	box1.p.center.set([0, 0, -0.6]);
	bboxScatter1.setInput(0, box1);

	const cameraProject1 = geo1.createNode('cameraProject');
	cameraProject1.setInput(0, bboxScatter1);
	cameraProject1.setInput(1, cameraNode);
	return cameraProject1;
}
async function getBbox(cameraProject: CameraProjectSopNode) {
	const container = await cameraProject.compute();
	const core_group = container.coreContent()!;
	const geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
	geometry.computeBoundingBox();
	return geometry.boundingBox!;
}

qUnit.test('sop/cameraProject simple', async (assert) => {
	const cameraNode = await createCameraNode();
	const geo1 = window.geo1;
	const cameraProject1 = await createCameraProject(cameraNode);

	let bbox = await getBbox(cameraProject1);

	assert.in_delta(bbox.min.x, -0.5244, 0.1);
	assert.in_delta(bbox.max.x, 0.52443, 0.1);
	assert.in_delta(bbox.min.y, -0.5244, 0.1);
	assert.in_delta(bbox.max.y, 0.52443, 0.1);
	assert.in_delta(bbox.min.z, -4.333, 0.1);
	assert.in_delta(bbox.max.z, -1.55, 0.1);

	const cameraProject2 = geo1.createNode('cameraProject');
	cameraProject2.setInput(0, cameraProject1);
	cameraProject2.setInput(1, cameraNode);
	cameraProject2.p.project.set(false);

	bbox = await getBbox(cameraProject2);

	assert.in_delta(bbox.min.x, -0.25, 0.1);
	assert.in_delta(bbox.max.x, 0.25, 0.1);
	assert.in_delta(bbox.min.y, -0.25, 0.1);
	assert.in_delta(bbox.max.y, 0.25, 0.1);
	assert.in_delta(bbox.min.z, -0.8, 0.1);
	assert.in_delta(bbox.max.z, -0.4, 0.1);
});

}