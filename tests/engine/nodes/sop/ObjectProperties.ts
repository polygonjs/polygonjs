QUnit.test('object_properties simple', async (assert) => {
	let container;
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');
	const object_properties1 = geo1.createNode('objectProperties');
	object_properties1.setInput(0, plane1);

	object_properties1.p.tcastShadow.set(1);
	object_properties1.p.treceiveShadow.set(1);

	container = await object_properties1.requestContainer();
	let object = container.coreContent()!.objects()[0];
	assert.ok(object.castShadow);
	assert.ok(object.receiveShadow);

	object_properties1.setInput(0, plane1);
	container = await object_properties1.requestContainer();
	object = container.coreContent()!.objects()[0];
	assert.ok(object.castShadow);
	assert.ok(object.receiveShadow);

	object_properties1.p.castShadow.set(0);
	container = await object_properties1.requestContainer();
	object = container.coreContent()!.objects()[0];
	assert.ok(!object.castShadow);
	assert.ok(object.receiveShadow);

	object_properties1.p.receiveShadow.set(0);
	container = await object_properties1.requestContainer();
	object = container.coreContent()!.objects()[0];
	assert.ok(!object.castShadow);
	assert.ok(!object.receiveShadow);

	assert.ok(!object.matrixAutoUpdate);
	object_properties1.p.tmatrixAutoUpdate.set(1);
	object_properties1.p.matrixAutoUpdate.set(1);
	container = await object_properties1.requestContainer();
	object = container.coreContent()!.objects()[0];
	assert.ok(object.matrixAutoUpdate);

	assert.ok(object.visible, 'object is visible');
	object_properties1.p.tvisible.set(1);
	object_properties1.p.visible.set(0);
	container = await object_properties1.requestContainer();
	object = container.coreContent()!.objects()[0];
	assert.ok(!object.visible);
});
