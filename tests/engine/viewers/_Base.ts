import {Poly} from '../../../src/engine/Poly';
import {HTMLElementWithViewer} from '../../../src/engine/viewers/_Base';
import {ThreejsViewer} from '../../../src/engine/viewers/Threejs';
import {RendererUtils} from '../../helpers/RendererUtils';

QUnit.test('viewer domElement is assigned scene and viewer', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const cameraNode = window.perspective_camera1;

	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		const elementWithScene = element as HTMLElementWithViewer<any>;
		assert.deepEqual(elementWithScene.scene, scene);
		assert.deepEqual(elementWithScene.viewer, viewer);
		assert.deepEqual(elementWithScene.Poly, Poly);
	});
});

QUnit.test('viewer has a viewer with and without post processing', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const cameraNode = window.perspective_camera1;

	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		const canvas = viewer.canvas();
		assert.ok(canvas);
		const renderer = viewer.renderer()!;
		assert.ok(renderer);
	});

	const postProcessingNetwork = cameraNode.createNode('postProcessNetwork');
	const bloom1 = postProcessingNetwork.createNode('bloom');
	bloom1.flags.display.set(true);
	cameraNode.p.postProcessNode.setNode(postProcessingNetwork);
	cameraNode.p.doPostProcess.set(true);
	await cameraNode.compute();
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		const canvas = viewer.canvas();
		assert.ok(canvas);
		const renderer = viewer.renderer()!;
		assert.ok(renderer);
		const effectComposer = (viewer as ThreejsViewer<any>).effectComposer()!;
		assert.ok(effectComposer);
		assert.ok(effectComposer.getRenderer());
	});
});
