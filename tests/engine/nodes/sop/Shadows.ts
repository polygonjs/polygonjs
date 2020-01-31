QUnit.test('shadows simple', async (assert) => {
	let container;
	const geo1 = window.geo1;
	const plane1 = geo1.create_node('plane');
	const shadows1 = geo1.create_node('shadows');
	shadows1.set_input(0, plane1);

	container = await shadows1.request_container();
	let object = container.core_content()!.objects()[0];
	assert.ok(object.castShadow);
	assert.ok(object.receiveShadow);

	shadows1.set_input(0, plane1);
	container = await shadows1.request_container();
	object = container.core_content()!.objects()[0];
	assert.ok(object.castShadow);
	assert.ok(object.receiveShadow);

	shadows1.p.cast_shadow.set(0);
	container = await shadows1.request_container();
	object = container.core_content()!.objects()[0];
	assert.ok(!object.castShadow);
	assert.ok(object.receiveShadow);

	shadows1.p.receive_shadow.set(0);
	container = await shadows1.request_container();
	object = container.core_content()!.objects()[0];
	assert.ok(!object.castShadow);
	assert.ok(!object.receiveShadow);
});
