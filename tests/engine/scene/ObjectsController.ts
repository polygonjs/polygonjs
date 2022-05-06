QUnit.test('scene can find one top node by mask', async (assert) => {
	const scene = window.scene;
	const camera = window.perspective_camera1;

	let foundObject = scene.findObjectByMask('/perspectiveCamera1');
	assert.ok(foundObject);
	assert.equal(foundObject!.uuid, camera.object.uuid);
	foundObject = scene.findObjectByMask('*perspectiveCamera*');
	assert.equal(foundObject!.uuid, camera.object.uuid);
	foundObject = scene.findObjectByMask('*/perspectiveCamera1');
	assert.equal(foundObject!.uuid, camera.object.uuid);
	foundObject = scene.findObjectByMask('/perspectiveCamera*');
	assert.equal(foundObject!.uuid, camera.object.uuid);
	// foundObject = scene.findObjectByMask('*/perspectiveCamerad\\d');
	// assert.equal(foundObject!.uuid, camera.object.uuid);

	foundObject = scene.findObjectByMask('/perspectiveCamera');
	assert.notOk(foundObject);
});

QUnit.test('scene can find top nodes by mask', async (assert) => {
	const scene = window.scene;
	const camera = window.perspective_camera1;

	let foundObjects = scene.objectsByMask('/perspectiveCamera1');
	assert.ok(foundObjects[0], 'cam found (0)');
	assert.equal(foundObjects[0]!.uuid, camera.object.uuid, 'cam is expected object');
	foundObjects = scene.objectsByMask('*perspectiveCamera*');
	assert.equal(foundObjects[0]!.uuid, camera.object.uuid, 'cam found (1)');
	foundObjects = scene.objectsByMask('*/perspectiveCamera1');
	assert.equal(foundObjects[0]!.uuid, camera.object.uuid, 'cam found (2)');
	foundObjects = scene.objectsByMask('/perspectiveCamera*');
	assert.equal(foundObjects[0]!.uuid, camera.object.uuid, 'cam found (3)');
	// foundObject = scene.findObjectByMask('*/perspectiveCamerad\\d');
	// assert.equal(foundObject!.uuid, camera.object.uuid);

	foundObjects = scene.objectsByMask('/perspectiveCamera');
	assert.notOk(foundObjects[0], 'cam not found (ok)');
});
