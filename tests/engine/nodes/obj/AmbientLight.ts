QUnit.test('ambient light simple', async (assert) => {
	const scene = window.scene;
	const main_group = scene.default_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2, 'world has 2 children');
	assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

	const ambient_light1 = scene.root.createNode('ambientLight');
	assert.equal(ambient_light1.name, 'ambientLight1');
	assert.equal(main_group.children.length, 3);

	const ambient_light2 = scene.root.createNode('ambientLight');
	assert.equal(ambient_light2.name, 'ambientLight2');
	assert.equal(main_group.children.length, 4);

	assert.equal(main_group.children[2].name, '/ambientLight1');
	assert.equal(main_group.children[3].name, '/ambientLight2');

	assert.equal(ambient_light1.graph_all_successors().length, 0);

	window.scene.performance.start();

	assert.equal(ambient_light1.cook_controller.cooks_count, 0);
	const light_object1 = main_group.children[2];
	const light_from_light_object1 = light_object1.children[1];
	ambient_light1.p.intensity.set(2);
	await scene.wait_for_cooks_completed();
	assert.equal(light_from_light_object1.uuid, ambient_light1.light.uuid);
	assert.equal(ambient_light1.light.intensity, 2, 'intensity should be 2');
	assert.equal(ambient_light1.cook_controller.cooks_count, 1, 'cooks count should be 1');

	window.scene.performance.stop();
});

QUnit.test('ambient light display flag off removes from scene', async (assert) => {
	const scene = window.scene;
	const main_group = scene.default_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/geo1:/perspectiveCamera1'
	);

	const ambient_light1 = scene.root.createNode('ambientLight');
	assert.equal(ambient_light1.name, 'ambientLight1');
	assert.equal(main_group.children.length, 3);
	const ambient_light_object = main_group.children[2];
	assert.equal(ambient_light_object.uuid, ambient_light1.object.uuid);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/ambientLight1:/geo1:/perspectiveCamera1'
	);
	assert.equal(ambient_light_object.children.length, 2);

	ambient_light1.flags.display.set(false);
	assert.equal(main_group.children.length, 3);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/ambientLight1:/geo1:/perspectiveCamera1'
	);
	assert.equal(ambient_light_object.children.length, 1);

	ambient_light1.flags.display.set(true);
	assert.equal(ambient_light_object.children.length, 2);
});

QUnit.test('ambient light display flag off still cooks', async (assert) => {
	const scene = window.scene;
	const main_group = scene.default_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

	const ambient_light1 = scene.root.createNode('ambientLight');
	assert.equal(ambient_light1.name, 'ambientLight1');
	assert.equal(main_group.children.length, 3);

	await scene.wait_for_cooks_completed();
	ambient_light1.flags.display.set(false);
	assert.equal(main_group.children.length, 3);

	window.scene.performance.start();

	assert.equal(ambient_light1.cook_controller.cooks_count, 0);
	ambient_light1.p.intensity.set(2);
	await scene.wait_for_cooks_completed();
	assert.equal(ambient_light1.light.intensity, 2, 'intensity is updated');
	assert.equal(ambient_light1.cook_controller.cooks_count, 1, 'has cooked');

	window.scene.performance.stop();
});

QUnit.test('ambient light is removed from scene when node is deleted', async (assert) => {
	const scene = window.scene;
	const main_group = scene.default_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/geo1:/perspectiveCamera1'
	);

	const ambient_light1 = scene.root.createNode('ambientLight');
	assert.equal(ambient_light1.name, 'ambientLight1');
	assert.equal(main_group.children.length, 3);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/ambientLight1:/geo1:/perspectiveCamera1'
	);

	scene.root.removeNode(ambient_light1);
	assert.equal(main_group.children.length, 2);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/geo1:/perspectiveCamera1'
	);
});

QUnit.test('ambient light cooks only once when multiple params are updated', async (assert) => {
	const scene = window.scene;
	const main_group = scene.default_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

	const ambient_light1 = scene.root.createNode('ambientLight');
	assert.equal(ambient_light1.name, 'ambientLight1');
	assert.equal(main_group.children.length, 3);

	window.scene.performance.start();

	assert.equal(ambient_light1.cook_controller.cooks_count, 0);
	const ambient_light_group = main_group.children[2];
	const light_object = ambient_light1.light;
	scene.batch_update(() => {
		ambient_light1.p.intensity.set(2);
		ambient_light1.p.color.set([2, 1, 3]);
	});
	await scene.wait_for_cooks_completed();
	assert.equal(light_object.uuid, ambient_light_group.children[1].uuid);
	assert.equal(light_object.intensity, 2, 'intensity should be 2');
	assert.in_delta(light_object.color.r, 5, 1, 'color should be 2,1,3');
	assert.in_delta(light_object.color.g, 1, 1, 'color should be 2,1,3');
	assert.in_delta(light_object.color.b, 12.8, 1, 'color should be 2,1,3');
	assert.equal(ambient_light1.cook_controller.cooks_count, 1, 'cooks count should be 1');

	window.scene.performance.stop();
});
