QUnit.test('spot light helper does not get shown when turning light on and off', async (assert) => {
	const scene = window.scene;
	const main_group = scene.default_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspective_camera1'].sort());

	const spot_light1 = scene.root.create_node('spot_light');
	assert.equal(spot_light1.name, 'spot_light1');
	assert.equal(main_group.children.length, 3);
	assert.equal(spot_light1.object.children.length, 3, '3 children');
	assert.equal(spot_light1.light.children.length, 0, 'no helper');

	// toggle show helper
	spot_light1.p.show_helper.set(1);
	await spot_light1.request_container();
	assert.equal(spot_light1.object.children.length, 3, '3 children');
	assert.equal(spot_light1.light.children.length, 1, 'helper is added');

	spot_light1.p.show_helper.set(0);
	await spot_light1.request_container();
	assert.equal(spot_light1.object.children.length, 3, '3 children');
	assert.equal(spot_light1.light.children.length, 0, 'no helper');

	// toggle display flag while helper is visible
	spot_light1.p.show_helper.set(1);
	await spot_light1.request_container();
	assert.equal(spot_light1.light.children.length, 1, 'helper is added');
	spot_light1.flags.display.set(false);
	assert.equal(spot_light1.light.children.length, 0, 'no helper');
	spot_light1.flags.display.set(true);
	assert.equal(spot_light1.light.children.length, 1, 'helper added');

	// toggle display flag while helper is not visible
	spot_light1.p.show_helper.set(0);
	await spot_light1.request_container();
	assert.equal(spot_light1.light.children.length, 0, 'no helper');
	spot_light1.flags.display.set(false);
	assert.equal(spot_light1.light.children.length, 0, 'no helper');
	spot_light1.flags.display.set(true);
	assert.equal(spot_light1.light.children.length, 0, 'no helper');
});
