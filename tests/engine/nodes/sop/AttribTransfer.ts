QUnit.test('attrib_transfer simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	plane1.p.direction.set([0, 1, 0]);
	const add1 = geo1.createNode('add');
	const attrib_create1 = geo1.createNode('attribCreate');
	const attrib_create2 = geo1.createNode('attribCreate');
	const attrib_transfer1 = geo1.createNode('attribTransfer');

	attrib_create1.setInput(0, plane1);
	attrib_create2.setInput(0, add1);
	attrib_transfer1.setInput(0, attrib_create1);
	attrib_transfer1.setInput(1, attrib_create2);

	add1.p.position.set([0.5, 0, 0.5]);
	attrib_create1.p.name.set('test');
	attrib_create2.p.name.set('test');
	attrib_create2.p.value1.set(1);
	attrib_transfer1.p.name.set('test');

	let container, core_group, array;
	container = await attrib_transfer1.compute();
	core_group = container.coreContent()!;
	array = core_group.objectsWithGeo()[0].geometry.getAttribute('test').array;
	assert.deepEqual(Array.from(array), [0, 1, 1, 1]);

	// attrib_transfer1.p.distance_threshold.set(0.5);
	// container = await attrib_transfer1.compute();
	// core_group = container.coreContent()!;
	// array = core_group.objects()[0].geometry.getAttribute('test').array;
	// assert.deepEqual(Array.from(array), [0, 0, 0, 1]);
});
