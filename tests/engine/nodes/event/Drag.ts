QUnit.test('drag event nodes simple', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading());

	const element = document.createElement('div');
	document.body.appendChild(element);
	const perspective_camera1 = window.perspective_camera1;
	const viewer = perspective_camera1.createViewer(element);

	assert.deepEqual(viewer.eventsController.registeredEventTypes(), []);

	const events = scene.root().createNode('eventsNetwork');
	const drag1 = events.createNode('drag');
	await drag1.compute();
	assert.deepEqual(viewer.eventsController.registeredEventTypes(), ['dragover']);

	drag1.p.active.set(0);
	await drag1.compute();
	assert.deepEqual(viewer.eventsController.registeredEventTypes(), [], 'no events if node is set to inactive');

	drag1.p.active.set(1);
	await drag1.compute();
	assert.deepEqual(viewer.eventsController.registeredEventTypes(), ['dragover']);

	drag1.p.dragover.set(0);
	await drag1.compute();
	assert.deepEqual(viewer.eventsController.registeredEventTypes(), []);

	events.removeNode(drag1);
	await drag1.compute();
	assert.deepEqual(viewer.eventsController.registeredEventTypes(), []);

	drag1.p.active.set(1);
	await drag1.compute();
	assert.deepEqual(
		viewer.eventsController.registeredEventTypes(),
		[],
		'setting a deleted node to active does not update the register'
	);

	const drag2 = events.createNode('drag');
	await drag2.compute();
	drag2.p.dragover.set(0);
	await drag2.compute();
	drag2.p.dragover.set(1);
	await drag2.compute();
	// creating a new viewer will set its listeners correctly as well
	const element2 = document.createElement('div');
	document.body.appendChild(element2);
	const viewer2 = perspective_camera1.createViewer(element);
	assert.deepEqual(viewer2.eventsController.registeredEventTypes(), ['dragover']);

	// clear elements
	viewer.dispose();
	viewer2.dispose();
	document.body.removeChild(element);
	document.body.removeChild(element2);
});
