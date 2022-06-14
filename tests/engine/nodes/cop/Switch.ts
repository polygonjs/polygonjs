import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {CoreSleep} from '../../../../src/core/Sleep';

function _url(path: string) {
	return `${ASSETS_ROOT}${path}`;
}

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

	file_diffuse1.p.url.set(_url('textures/uv.jpg'));
	file_diffuse2.p.url.set(_url('textures/doesnotexists.jpg'));
	file_env1.p.url.set(_url('textures/piz_compressed.exr'));
	file_env2.p.url.set(_url('textures/equirectangular/quarry_01_1k.hdr'));
	const texture_diffuse1 = (await file_diffuse1.compute()).texture();
	const texture_diffuse2 = (await file_diffuse2.compute()).texture();
	const texture_env1 = (await file_env1.compute()).texture();
	const texture_env2 = (await file_env2.compute()).texture();

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
	mesh_standard1.p.map.set(null_diffuse.path());
	mesh_standard1.p.useMap.set(1);
	mesh_standard1.p.envMap.set(null_env.path());
	mesh_standard1.p.useEnvMap.set(1);

	// const sphere1 = geo1.createNode('sphere');
	// const material1 = geo1.createNode('material');
	// material1.setInput(0, sphere1);
	// material1.p.material.set(mesh_standard1.path());

	const material = mesh_standard1.material;

	await mesh_standard1.compute();
	await scene.waitForCooksCompleted();
	assert.equal(mesh_standard1.cookController.cooksCount(), 1);
	assert.equal(material.map!.uuid, texture_diffuse1.uuid);
	assert.equal(material.envMap!.uuid, texture_env1.uuid);

	switch_diffuse.p.input.set(1);
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(500);
	assert.equal(mesh_standard1.cookController.cooksCount(), 1);
	assert.equal(material.map!.uuid, texture_diffuse2.uuid);

	switch_env.p.input.set(1);
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(100);
	assert.equal(mesh_standard1.cookController.cooksCount(), 1);
	assert.equal(material.envMap!.uuid, texture_env2.uuid);

	switch_diffuse.p.input.set(0);
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(100);
	assert.equal(mesh_standard1.cookController.cooksCount(), 1);
	assert.equal(material.map!.uuid, texture_diffuse1.uuid);

	switch_env.p.input.set(0);
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(100);
	assert.equal(mesh_standard1.cookController.cooksCount(), 1);
	assert.equal(material.envMap!.uuid, texture_env1.uuid);

	// and finally change the path of a file node, to renew its texture completely
	file_diffuse1.p.url.set(_url('textures/equirectangular.png'));
	const file_diffuse1_old_uuid = texture_diffuse1.uuid;
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(100);
	const texture_diffuse1B = (await file_diffuse1.compute()).texture();
	assert.notEqual(file_diffuse1_old_uuid, texture_diffuse1B.uuid);
	assert.equal(mesh_standard1.cookController.cooksCount(), 1);
	assert.equal(material.map!.uuid, texture_diffuse1B.uuid);

	// and the env node
	file_env1.p.url.set(_url('textures/equirectangular.png'));
	const file_env1_old_uuid = texture_env1.uuid;
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(100);
	const texture_env1B = (await file_env1.compute()).texture();
	assert.notEqual(file_env1_old_uuid, texture_env1B.uuid);
	assert.equal(mesh_standard1.cookController.cooksCount(), 1);
	assert.equal(material.envMap!.uuid, texture_env1B.uuid);

	window.scene.performance.stop();
});
