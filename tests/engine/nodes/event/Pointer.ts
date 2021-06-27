QUnit.test('pointer event nodes simple', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading());

	const element = document.createElement('div');
	document.body.appendChild(element);
	const perspective_camera1 = window.perspective_camera1;
	const viewer = perspective_camera1.createViewer(element);

	assert.deepEqual(viewer.eventsController.registeredEventTypes(), []);

	const events = scene.root().createNode('eventsNetwork');
	const pointer1 = events.createNode('pointer');
	await pointer1.compute();
	assert.deepEqual(viewer.eventsController.registeredEventTypes(), ['pointerdown']);

	pointer1.p.active.set(0);
	await pointer1.compute();
	assert.deepEqual(viewer.eventsController.registeredEventTypes(), [], 'no events if node is set to inactive');

	pointer1.p.active.set(1);
	await pointer1.compute();
	assert.deepEqual(viewer.eventsController.registeredEventTypes(), ['pointerdown']);

	pointer1.p.pointerdown.set(0);
	await pointer1.compute();
	assert.deepEqual(viewer.eventsController.registeredEventTypes(), []);

	pointer1.p.pointermove.set(1);
	await pointer1.compute();
	assert.deepEqual(viewer.eventsController.registeredEventTypes(), ['pointermove']);

	events.removeNode(pointer1);
	await pointer1.compute();
	assert.deepEqual(viewer.eventsController.registeredEventTypes(), []);

	pointer1.p.active.set(1);
	await pointer1.compute();
	assert.deepEqual(
		viewer.eventsController.registeredEventTypes(),
		[],
		'setting a deleted node to active does not update the register'
	);

	const pointer2 = events.createNode('pointer');
	await pointer2.compute();
	pointer2.p.pointerdown.set(0);
	await pointer2.compute();
	pointer2.p.pointermove.set(1);
	await pointer2.compute();
	// creating a new viewer will set its listeners correctly as well
	const element2 = document.createElement('div');
	document.body.appendChild(element2);
	const viewer2 = perspective_camera1.createViewer(element);
	assert.deepEqual(viewer2.eventsController.registeredEventTypes(), ['pointermove']);

	// clear elements
	viewer.dispose();
	viewer2.dispose();
	document.body.removeChild(element);
	document.body.removeChild(element2);
});
