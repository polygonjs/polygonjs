import {CameraAttribute, PerspectiveCameraAttribute} from '../../../../src/core/camera/CoreCamera';
import {CoreObject} from '../../../../src/core/geometry/Object';

QUnit.test('sop/perspectiveCamera simple', async (assert) => {
	const geo1 = window.geo1;

	const perspectiveCamera1 = geo1.createNode('perspectiveCamera');
	const cameraControls1 = geo1.createNode('cameraControls');
	const cameraCSSRenderer1 = geo1.createNode('cameraCSSRenderer');
	const cameraFrameMode1 = geo1.createNode('cameraFrameMode');
	const cameraPostProcess1 = geo1.createNode('cameraPostProcess');
	const cameraRenderer1 = geo1.createNode('cameraRenderer');
	const cameraRenderScene1 = geo1.createNode('cameraRenderScene');

	cameraControls1.setInput(0, perspectiveCamera1);
	cameraCSSRenderer1.setInput(0, cameraControls1);
	cameraFrameMode1.setInput(0, cameraCSSRenderer1);
	cameraPostProcess1.setInput(0, cameraFrameMode1);
	cameraRenderer1.setInput(0, cameraPostProcess1);
	cameraRenderScene1.setInput(0, cameraRenderer1);

	perspectiveCamera1.p.fov.set(55);
	const cameraOrbitControls1 = cameraControls1.createNode('cameraOrbitControls');
	cameraControls1.p.node.setNode(cameraOrbitControls1, {relative: true});
	const CSS2DRenderer1 = cameraCSSRenderer1.createNode('CSS2DRenderer');
	cameraCSSRenderer1.p.node.setNode(CSS2DRenderer1, {relative: true});
	cameraPostProcess1.createNode('bloom');
	cameraPostProcess1.p.useOtherNode.set(false);
	const WebGLRenderer1 = cameraRenderer1.createNode('WebGLRenderer');
	cameraRenderer1.p.node.setNode(WebGLRenderer1, {relative: true});
	const sceneNode = window.scene.createNode('scene');
	cameraRenderScene1.p.node.setNode(sceneNode);

	cameraRenderScene1.flags.display.set(true);

	const container = await cameraRenderScene1.compute();
	const object = container.coreContent()!.objects()[0];
	assert.ok(object);
	assert.equal(
		CoreObject.attribValue(object, CameraAttribute.CONTROLS_NODE_ID),
		cameraOrbitControls1.graphNodeId(),
		CameraAttribute.CONTROLS_NODE_ID
	);
	assert.equal(
		CoreObject.attribValue(object, CameraAttribute.CSS_RENDERER_NODE_ID),
		CSS2DRenderer1.graphNodeId(),
		CameraAttribute.CSS_RENDERER_NODE_ID
	);
	assert.equal(CoreObject.attribValue(object, CameraAttribute.FRAME_MODE), 0, CameraAttribute.FRAME_MODE);
	assert.equal(
		CoreObject.attribValue(object, CameraAttribute.FRAME_MODE_EXPECTED_ASPECT_RATIO),
		16 / 9,
		CameraAttribute.FRAME_MODE_EXPECTED_ASPECT_RATIO
	);
	assert.equal(
		CoreObject.attribValue(object, CameraAttribute.POST_PROCESS_NODE_ID),
		cameraPostProcess1.graphNodeId(),
		CameraAttribute.POST_PROCESS_NODE_ID
	);
	assert.equal(
		CoreObject.attribValue(object, CameraAttribute.RENDERER_NODE_ID),
		WebGLRenderer1.graphNodeId(),
		CameraAttribute.RENDERER_NODE_ID
	);
	assert.equal(
		CoreObject.attribValue(object, CameraAttribute.RENDER_SCENE_NODE_ID),
		sceneNode.graphNodeId(),
		CameraAttribute.RENDER_SCENE_NODE_ID
	);
	assert.equal(CoreObject.attribValue(object, PerspectiveCameraAttribute.FOV), 55, PerspectiveCameraAttribute.FOV);
});
