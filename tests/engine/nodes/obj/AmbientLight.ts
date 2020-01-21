import {AmbientLight} from 'three/src/lights/AmbientLight';

QUnit.test('ambient light simple', async (assert) => {
	const scene = window.scene;
	const main_group = scene.display_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(main_group.children[0].name, '/geo1');
	assert.equal(main_group.children[1].name, '/perspective_camera1');

	const ambient_light1 = scene.root.create_node('ambient_light');
	assert.equal(ambient_light1.name, 'ambient_light1');
	assert.equal(main_group.children.length, 3);

	const ambient_light2 = scene.root.create_node('ambient_light');
	assert.equal(ambient_light2.name, 'ambient_light2');
	assert.equal(main_group.children.length, 4);

	assert.equal(main_group.children[2].name, '/ambient_light1');
	assert.equal(main_group.children[3].name, '/ambient_light2');

	assert.equal(ambient_light1.graph_all_successors().length, 0);

	window.scene.performance.start();

	assert.equal(ambient_light1.cook_controller.cooks_count, 0);
	const light_object1 = main_group.children[2] as AmbientLight;
	ambient_light1.p.intensity.set(2);
	await window.sleep(100);
	assert.equal(ambient_light1.object.uuid, light_object1.uuid);
	assert.equal(light_object1.intensity, 2, 'intensity should be 2');
	assert.equal(ambient_light1.cook_controller.cooks_count, 1, 'cooks count should be 1');

	window.scene.performance.stop();
});

QUnit.test('ambient light display flag off removes from scene', async (assert) => {
	const scene = window.scene;
	const main_group = scene.display_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/geo1:/perspective_camera1'
	);

	const ambient_light1 = scene.root.create_node('ambient_light');
	assert.equal(ambient_light1.name, 'ambient_light1');
	assert.equal(main_group.children.length, 3);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/ambient_light1:/geo1:/perspective_camera1'
	);

	ambient_light1.flags.display.set(false);
	assert.equal(main_group.children.length, 2);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/geo1:/perspective_camera1'
	);
});

QUnit.test('ambient light display flag off does not cook', async (assert) => {
	const scene = window.scene;
	const main_group = scene.display_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(main_group.children[0].name, '/geo1');
	assert.equal(main_group.children[1].name, '/perspective_camera1');

	const ambient_light1 = scene.root.create_node('ambient_light');
	assert.equal(ambient_light1.name, 'ambient_light1');
	assert.equal(main_group.children.length, 3);

	await window.sleep(10);
	ambient_light1.flags.display.set(false);
	assert.equal(main_group.children.length, 2);

	window.scene.performance.start();

	assert.equal(ambient_light1.cook_controller.cooks_count, 0);
	ambient_light1.p.intensity.set(2);
	await window.sleep(100);
	assert.equal(ambient_light1.object.intensity, 1, 'intensity should be 1');
	assert.equal(ambient_light1.cook_controller.cooks_count, 0, 'should not have cooked');

	window.scene.performance.stop();
});

QUnit.test('ambient light is removed from scene when node is deleted', async (assert) => {
	const scene = window.scene;
	const main_group = scene.display_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/geo1:/perspective_camera1'
	);

	const ambient_light1 = scene.root.create_node('ambient_light');
	assert.equal(ambient_light1.name, 'ambient_light1');
	assert.equal(main_group.children.length, 3);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/ambient_light1:/geo1:/perspective_camera1'
	);

	scene.root.remove_node(ambient_light1);
	assert.equal(main_group.children.length, 2);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/geo1:/perspective_camera1'
	);
});

QUnit.test('ambient light cooks only once when multiple params are updated', async (assert) => {
	const scene = window.scene;
	const main_group = scene.display_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(main_group.children[0].name, '/geo1');
	assert.equal(main_group.children[1].name, '/perspective_camera1');

	const ambient_light1 = scene.root.create_node('ambient_light');
	assert.equal(ambient_light1.name, 'ambient_light1');
	assert.equal(main_group.children.length, 3);

	window.scene.performance.start();

	assert.equal(ambient_light1.cook_controller.cooks_count, 0);
	const light_object1 = main_group.children[2] as AmbientLight;
	scene.batch_update(() => {
		ambient_light1.p.intensity.set(2);
		ambient_light1.p.color.set([2, 1, 3]);
	});
	await window.sleep(100);
	assert.equal(ambient_light1.object.uuid, light_object1.uuid);
	assert.equal(light_object1.intensity, 2, 'intensity should be 2');
	assert.deepEqual(light_object1.color.toArray(), [2, 1, 3], 'color should be 2,1,3');
	assert.equal(ambient_light1.cook_controller.cooks_count, 1, 'cooks count should be 1');

	window.scene.performance.stop();
});
