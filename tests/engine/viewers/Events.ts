QUnit.test('mouse event nodes update the viewer event listeners', async (assert) => {
	const scene = window.scene;
	await scene.wait_for_cooks_completed();
	assert.ok(!scene.loading_controller.is_loading);

	const element = document.createElement('div');
	document.body.appendChild(element);
	const perspective_camera1 = window.perspective_camera1;
	const viewer = perspective_camera1.create_viewer(element);

	assert.deepEqual(viewer.events_controller.registered_event_types(), []);

	const events = scene.root.create_node('events');
	const mouse1 = events.create_node('mouse');

	assert.deepEqual(viewer.events_controller.registered_event_types(), ['mousedown', 'mousemove', 'mouseup']);

	mouse1.p.active.set(0);
	assert.deepEqual(viewer.events_controller.registered_event_types(), [], 'no events if node is set to inactive');

	mouse1.p.active.set(1);
	assert.deepEqual(viewer.events_controller.registered_event_types(), ['mousedown', 'mousemove', 'mouseup']);

	mouse1.p.mousedown.set(0);
	mouse1.p.mousemove.set(0);
	mouse1.p.mouseup.set(0);
	assert.deepEqual(viewer.events_controller.registered_event_types(), []);

	mouse1.p.mousedown.set(1);
	assert.deepEqual(viewer.events_controller.registered_event_types(), ['mousedown']);

	events.remove_node(mouse1);
	assert.deepEqual(viewer.events_controller.registered_event_types(), []);

	mouse1.p.active.set(1);
	assert.deepEqual(
		viewer.events_controller.registered_event_types(),
		[],
		'setting a deleted node to active does not update the register'
	);

	const mouse2 = events.create_node('mouse');
	mouse2.p.mousemove.set(0);
	mouse2.p.mouseup.set(0);
	mouse2.p.mousedown.set(1);
	mouse2.p.click.set(1);
	// creating a new viewer will set its listeners correctly as well
	const element2 = document.createElement('div');
	document.body.appendChild(element2);
	const viewer2 = perspective_camera1.create_viewer(element);
	assert.deepEqual(viewer2.events_controller.registered_event_types(), ['click', 'mousedown']);

	// clear elements
	viewer.dispose();
	viewer2.dispose();
	document.body.removeChild(element);
	document.body.removeChild(element2);
});

QUnit.test('keyboard event nodes update the viewer event listeners', async (assert) => {
	const scene = window.scene;
	await scene.wait_for_cooks_completed();
	assert.ok(!scene.loading_controller.is_loading);

	const element = document.createElement('div');
	document.body.appendChild(element);
	const perspective_camera1 = window.perspective_camera1;
	const viewer = perspective_camera1.create_viewer(element);

	assert.deepEqual(viewer.events_controller.registered_event_types(), []);

	const events = scene.root.create_node('events');
	const keyboard1 = events.create_node('keyboard');

	assert.deepEqual(viewer.events_controller.registered_event_types(), ['keydown']);

	keyboard1.p.active.set(0);
	assert.deepEqual(viewer.events_controller.registered_event_types(), [], 'no events if node is set to inactive');

	keyboard1.p.active.set(1);
	assert.deepEqual(viewer.events_controller.registered_event_types(), ['keydown']);

	keyboard1.p.keydown.set(0);
	assert.deepEqual(viewer.events_controller.registered_event_types(), []);

	keyboard1.p.keyup.set(1);
	assert.deepEqual(viewer.events_controller.registered_event_types(), ['keyup']);

	events.remove_node(keyboard1);
	assert.deepEqual(viewer.events_controller.registered_event_types(), []);

	keyboard1.p.active.set(1);
	assert.deepEqual(
		viewer.events_controller.registered_event_types(),
		[],
		'setting a deleted node to active does not update the register'
	);

	const keyboard2 = events.create_node('keyboard');
	keyboard2.p.keydown.set(0);
	keyboard2.p.keypress.set(1);
	// creating a new viewer will set its listeners correctly as well
	const element2 = document.createElement('div');
	document.body.appendChild(element2);
	const viewer2 = perspective_camera1.create_viewer(element);
	assert.deepEqual(viewer2.events_controller.registered_event_types(), ['keypress']);

	// clear elements
	viewer.dispose();
	viewer2.dispose();
	document.body.removeChild(element);
	document.body.removeChild(element2);
});

QUnit.test('scene event nodes do not add events to the viewer', async (assert) => {
	const scene = window.scene;
	await scene.wait_for_cooks_completed();
	assert.ok(!scene.loading_controller.is_loading);

	const element = document.createElement('div');
	document.body.appendChild(element);
	const perspective_camera1 = window.perspective_camera1;
	const viewer = perspective_camera1.create_viewer(element);

	assert.deepEqual(viewer.events_controller.registered_event_types(), []);

	const events = scene.root.create_node('events');
	const scene1 = events.create_node('scene');

	assert.deepEqual(viewer.events_controller.registered_event_types(), []);

	scene1.p.active.set(0);
	assert.deepEqual(viewer.events_controller.registered_event_types(), [], 'no events if node is set to inactive');

	scene1.p.active.set(1);
	assert.deepEqual(viewer.events_controller.registered_event_types(), []);

	scene1.p.tick.set(1);
	assert.deepEqual(viewer.events_controller.registered_event_types(), []);

	// clear elements
	viewer.dispose();
	document.body.removeChild(element);
});
