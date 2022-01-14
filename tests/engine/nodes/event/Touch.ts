import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('touch event nodes simple', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading());

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

		const events = scene.root().createNode('eventsNetwork');
		const touch1 = events.createNode('touch');
		await touch1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['touchstart']);

		touch1.p.active.set(0);
		await touch1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), [], 'no events if node is set to inactive');

		touch1.p.active.set(1);
		await touch1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['touchstart']);

		touch1.p.touchstart.set(0);
		await touch1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

		events.removeNode(touch1);
		await touch1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

		touch1.p.active.set(1);
		await touch1.compute();
		assert.deepEqual(
			viewer.eventsController().registeredEventTypes(),
			[],
			'setting a deleted node to active does not update the register'
		);

		const touch2 = events.createNode('touch');
		await touch2.compute();
		touch2.p.touchstart.set(0);
		await touch2.compute();
		touch2.p.touchmove.set(1);
		await touch2.compute();
		// creating a new viewer will set its listeners correctly as well
		const element2 = document.createElement('div');
		document.body.appendChild(element2);

		await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async (args2) => {
			assert.deepEqual(args2.viewer.eventsController().registeredEventTypes(), ['touchmove']);
		});
	});

	// clear elements
	// viewer.dispose();
	// viewer2.dispose();
	// document.body.removeChild(element);
	// document.body.removeChild(element2);
});
