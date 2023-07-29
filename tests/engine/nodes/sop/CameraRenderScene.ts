import type {QUnit} from '../../../helpers/QUnit';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {CameraAttribute} from '../../../../src/core/camera/CoreCamera';
export function testenginenodessopCameraRenderScene(qUnit: QUnit) {

qUnit.test('sop/cameraRenderScene simple', async (assert) => {
	const geo1 = window.geo1;
	const scene1 = window.scene.root().createNode('scene');
	const camera1 = geo1.createNode('perspectiveCamera');
	const cameraRenderScene1 = geo1.createNode('cameraRenderScene');
	cameraRenderScene1.p.node.setNode(scene1);
	cameraRenderScene1.setInput(0, camera1);
	const container = await cameraRenderScene1.compute();
	const objects = container.coreContent()!.allObjects()!;
	assert.equal(objects.length, 1);

	assert.equal(CoreObject.attribValue(objects[0], CameraAttribute.RENDER_SCENE_NODE_ID), scene1.graphNodeId());
});
qUnit.test('sop/cameraRenderScene applyToChildren', async (assert) => {
	const geo1 = window.geo1;
	const scene1 = window.scene.root().createNode('scene');
	const camera1 = geo1.createNode('perspectiveCamera');
	const hierarchy1 = geo1.createNode('hierarchy');
	const cameraRenderScene1 = geo1.createNode('cameraRenderScene');
	cameraRenderScene1.p.node.setNode(scene1);
	hierarchy1.setInput(0, camera1);
	cameraRenderScene1.setInput(0, hierarchy1);
	const container = await cameraRenderScene1.compute();
	const objects = container.coreContent()!.allObjects()!;
	assert.equal(objects.length, 1);

	assert.equal(CoreObject.attribValue(objects[0], CameraAttribute.RENDER_SCENE_NODE_ID), scene1.graphNodeId());
	assert.equal(
		CoreObject.attribValue(objects[0].children[0], CameraAttribute.RENDER_SCENE_NODE_ID),
		scene1.graphNodeId()
	);
});

}