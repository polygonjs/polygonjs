import {CoreObject} from '../../../../src/core/geometry/Object';
import {CameraAttribute} from '../../../../src/core/camera/CoreCamera';

QUnit.test('sop/cameraRenderer simple', async (assert) => {
	const geo1 = window.geo1;
	const camera1 = geo1.createNode('perspectiveCamera');
	const cameraRenderer1 = geo1.createNode('cameraRenderer');
	const webGLRenderer1 = cameraRenderer1.createNode('WebGLRenderer');
	cameraRenderer1.p.node.setNode(webGLRenderer1);
	cameraRenderer1.setInput(0, camera1);
	const container = await cameraRenderer1.compute();
	const objects = container.coreContent()!.allObjects()!;
	assert.equal(objects.length, 1);

	assert.equal(CoreObject.attribValue(objects[0], CameraAttribute.RENDERER_NODE_ID), webGLRenderer1.graphNodeId());
});
QUnit.test('sop/cameraRenderer applyToChildren', async (assert) => {
	const geo1 = window.geo1;
	const camera1 = geo1.createNode('perspectiveCamera');
	const hierarchy1 = geo1.createNode('hierarchy');
	const cameraRenderer1 = geo1.createNode('cameraRenderer');
	const webGLRenderer1 = cameraRenderer1.createNode('WebGLRenderer');
	cameraRenderer1.p.node.setNode(webGLRenderer1);
	hierarchy1.setInput(0, camera1);
	cameraRenderer1.setInput(0, hierarchy1);
	const container = await cameraRenderer1.compute();
	const objects = container.coreContent()!.allObjects()!;
	assert.equal(objects.length, 1);

	assert.equal(CoreObject.attribValue(objects[0], CameraAttribute.RENDERER_NODE_ID), webGLRenderer1.graphNodeId());
	assert.equal(
		CoreObject.attribValue(objects[0].children[0], CameraAttribute.RENDERER_NODE_ID),
		webGLRenderer1.graphNodeId()
	);
});
