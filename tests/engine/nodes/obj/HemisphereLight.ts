import {Color} from 'three/src/math/Color';

QUnit.test('hemisphere light simple', async (assert) => {
	const scene = window.scene;
	const main_group = scene.defaultScene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

	const hemisphere_light1 = scene.root.createNode('hemisphereLight');
	assert.equal(hemisphere_light1.name, 'hemisphereLight1');
	assert.equal(main_group.children.length, 3);

	assert.deepEqual(hemisphere_light1.p.sky_color.value_pre_conversion_serialized, [1, 1, 1]);
	assert.deepEqual(hemisphere_light1.p.ground_color.value_pre_conversion_serialized, [0, 0, 0]);

	hemisphere_light1.p.sky_color.set([0.2, 0.7, 1]);
	hemisphere_light1.p.ground_color.set([0.1, 0.1, 0.25]);
	assert.deepEqual(hemisphere_light1.p.sky_color.value_pre_conversion_serialized, [0.2, 0.7, 1]);
	assert.deepEqual(hemisphere_light1.p.ground_color.value_pre_conversion_serialized, [0.1, 0.1, 0.25]);
	const tmp = new Color();
	tmp.copy(hemisphere_light1.p.sky_color.value_pre_conversion);
	tmp.convertSRGBToLinear();
	assert.deepEqual(hemisphere_light1.pv.sky_color.toArray(), tmp.toArray());
	tmp.copy(hemisphere_light1.p.ground_color.value_pre_conversion);
	tmp.convertSRGBToLinear();
	assert.deepEqual(hemisphere_light1.pv.ground_color.toArray(), tmp.toArray());

	const hemisphere_light2 = scene.root.createNode('hemisphereLight');
	assert.equal(hemisphere_light2.name, 'hemisphereLight2');
	assert.equal(main_group.children.length, 4);

	assert.equal(main_group.children[2].name, '/hemisphereLight1');
	assert.equal(main_group.children[3].name, '/hemisphereLight2');

	assert.equal(hemisphere_light1.graph_all_successors().length, 0);

	window.scene.performance.start();

	assert.equal(hemisphere_light1.cook_controller.cooks_count, 0);
	const light_object1 = main_group.children[2];
	const light_from_light_object1 = light_object1.children[1];
	hemisphere_light1.p.intensity.set(2);
	await scene.wait_for_cooks_completed();
	assert.equal(light_from_light_object1.uuid, hemisphere_light1.light.uuid);
	assert.equal(hemisphere_light1.light.intensity, 2, 'intensity should be 2');
	assert.equal(hemisphere_light1.cook_controller.cooks_count, 2, 'cooks count should be 2');

	window.scene.performance.stop();
});

QUnit.test('hemisphere light params update as expected', async (assert) => {
	const scene = window.scene;
	const root = scene.root;
	const hemisphere_light = root.createNode('hemisphereLight');
	assert.equal(hemisphere_light.light.color.r, 1);
	hemisphere_light.p.sky_color.r.set(0.5);
	await scene.wait_for_cooks_completed();
	assert.in_delta(hemisphere_light.light.color.r, 0.21, 0.05);
});
