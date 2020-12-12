QUnit.test('object_properties simple', async (assert) => {
	let container;
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');
	const object_properties1 = geo1.createNode('object_properties');
	object_properties1.set_input(0, plane1);

	container = await object_properties1.request_container();
	let object = container.core_content()!.objects()[0];
	assert.ok(object.castShadow);
	assert.ok(object.receiveShadow);

	object_properties1.set_input(0, plane1);
	container = await object_properties1.request_container();
	object = container.core_content()!.objects()[0];
	assert.ok(object.castShadow);
	assert.ok(object.receiveShadow);

	object_properties1.p.cast_shadow.set(0);
	container = await object_properties1.request_container();
	object = container.core_content()!.objects()[0];
	assert.ok(!object.castShadow);
	assert.ok(object.receiveShadow);

	object_properties1.p.receive_shadow.set(0);
	container = await object_properties1.request_container();
	object = container.core_content()!.objects()[0];
	assert.ok(!object.castShadow);
	assert.ok(!object.receiveShadow);

	assert.ok(!object.matrixAutoUpdate);
	object_properties1.p.matrix_auto_update.set(1);
	container = await object_properties1.request_container();
	object = container.core_content()!.objects()[0];
	assert.ok(object.matrixAutoUpdate);

	assert.ok(object.visible, 'object is visible');
	object_properties1.p.visible.set(0);
	container = await object_properties1.request_container();
	object = container.core_content()!.objects()[0];
	assert.ok(!object.visible);
});
