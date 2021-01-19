QUnit.test('scene can fetch top nodes by mask', async (assert) => {
	const scene = window.scene;
	const camera = window.perspective_camera1;

	let foundObject = scene.findObjectByMask('/_WORLD_/perspectiveCamera1');
	assert.ok(foundObject);
	assert.equal(foundObject!.uuid, camera.object.uuid);
	foundObject = scene.findObjectByMask('*perspectiveCamera*');
	assert.equal(foundObject!.uuid, camera.object.uuid);
	foundObject = scene.findObjectByMask('*/perspectiveCamera1');
	assert.equal(foundObject!.uuid, camera.object.uuid);
	// foundObject = scene.findObjectByMask('*/perspectiveCamerad\\d');
	// assert.equal(foundObject!.uuid, camera.object.uuid);

	foundObject = scene.findObjectByMask('/perspectiveCamera1');
	assert.notOk(foundObject);
});
