import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('COP switch simple', async (assert) => {
	window.scene.performance.start();

	const scene = window.scene;
	// const geo1 = window.geo1;
	const COP = window.COP;
	const MAT = window.MAT;

	await scene.waitForCooksCompleted();

	const file_diffuse1 = COP.createNode('image');
	const file_diffuse2 = COP.createNode('image');
	const file_env1 = COP.createNode('image');
	const file_env2 = COP.createNode('image');

	file_diffuse1.p.url.set('/examples/textures/uv.jpg');
	file_diffuse2.p.url.set('/examples/textures/hardwood2_diffuse.jpg');
	file_env1.p.url.set('/examples/textures/piz_compressed.exr');
	file_env2.p.url.set('/examples/textures/equirectangular/quarry_01_1k.hdr');
	const texture_diffuse1 = (await file_diffuse1.requestContainer()).texture();
	const texture_diffuse2 = (await file_diffuse2.requestContainer()).texture();
	const texture_env1 = (await file_env1.requestContainer()).texture();
	const texture_env2 = (await file_env2.requestContainer()).texture();

	const switch_diffuse = COP.createNode('switch');
	const switch_env = COP.createNode('switch');
	switch_diffuse.setInput(0, file_diffuse1);
	switch_diffuse.setInput(1, file_diffuse2);
	switch_env.setInput(0, file_env1);
	switch_env.setInput(1, file_env2);

	const null_diffuse = COP.createNode('null');
	const null_env = COP.createNode('null');
	null_diffuse.setInput(0, switch_diffuse);
	null_env.setInput(0, switch_env);

	const mesh_standard1 = MAT.createNode('meshStandard');
	mesh_standard1.p.map.set(null_diffuse.fullPath());
	mesh_standard1.p.useMap.set(1);
	mesh_standard1.p.envMap.set(null_env.fullPath());
	mesh_standard1.p.useEnvMap.set(1);

	// const sphere1 = geo1.createNode('sphere');
	// const material1 = geo1.createNode('material');
	// material1.setInput(0, sphere1);
	// material1.p.material.set(mesh_standard1.fullPath());

	const material = mesh_standard1.material;

	await mesh_standard1.requestContainer();
	await scene.waitForCooksCompleted();
	assert.equal(mesh_standard1.cook_controller.cooks_count, 1);
	assert.equal(material.map!.uuid, texture_diffuse1.uuid);
	assert.equal(material.envMap!.uuid, texture_env1.uuid);

	switch_diffuse.p.input.set(1);
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(500);
	assert.equal(mesh_standard1.cook_controller.cooks_count, 1);
	assert.equal(material.map!.uuid, texture_diffuse2.uuid);

	switch_env.p.input.set(1);
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(100);
	assert.equal(mesh_standard1.cook_controller.cooks_count, 1);
	assert.equal(material.envMap!.uuid, texture_env2.uuid);

	switch_diffuse.p.input.set(0);
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(100);
	assert.equal(mesh_standard1.cook_controller.cooks_count, 1);
	assert.equal(material.map!.uuid, texture_diffuse1.uuid);

	switch_env.p.input.set(0);
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(100);
	assert.equal(mesh_standard1.cook_controller.cooks_count, 1);
	assert.equal(material.envMap!.uuid, texture_env1.uuid);

	// and finally change the path of a file node, to renew its texture completely
	file_diffuse1.p.url.set('/examples/textures/equirectangular.png');
	const file_diffuse1_old_uuid = texture_diffuse1.uuid;
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(100);
	const texture_diffuse1B = (await file_diffuse1.requestContainer()).texture();
	assert.notEqual(file_diffuse1_old_uuid, texture_diffuse1B.uuid);
	assert.equal(mesh_standard1.cook_controller.cooks_count, 1);
	assert.equal(material.map!.uuid, texture_diffuse1B.uuid);

	// and the env node
	file_env1.p.url.set('/examples/textures/equirectangular.png');
	const file_env1_old_uuid = texture_env1.uuid;
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(100);
	const texture_env1B = (await file_env1.requestContainer()).texture();
	assert.notEqual(file_env1_old_uuid, texture_env1B.uuid);
	assert.equal(mesh_standard1.cook_controller.cooks_count, 1);
	assert.equal(material.envMap!.uuid, texture_env1B.uuid);

	window.scene.performance.stop();
});
