QUnit.test('skin simple with 2 curves', async (assert) => {
	const geo1 = window.geo1;

	const line1 = geo1.createNode('line');
	const line2 = geo1.createNode('line');
	const transform1 = geo1.createNode('transform');
	const transform2 = geo1.createNode('transform');
	const merge1 = geo1.createNode('merge');
	const attrib_create1 = geo1.createNode('attribCreate');
	const skin1 = geo1.createNode('skin');
	const attrib_copy1 = geo1.createNode('attribCopy');

	transform1.setInput(0, line1);
	transform2.setInput(0, line2);
	merge1.setInput(0, transform1);
	merge1.setInput(1, transform2);
	attrib_create1.setInput(0, merge1);
	skin1.setInput(0, attrib_create1);
	attrib_copy1.setInput(0, skin1);
	attrib_copy1.setInput(1, attrib_create1);

	transform1.p.t.x.set(-1);
	attrib_create1.p.name.set('h');
	attrib_create1.p.value1.set('@ptnum');
	attrib_copy1.p.name.set('h');

	let container;
	let core_group;

	container = await line1.request_container();
	assert.equal(container.points_count(), 2);
	container = await line2.request_container();
	assert.equal(container.points_count(), 2);

	container = await attrib_create1.request_container();
	core_group = container.core_content()!;
	assert.deepEqual(core_group.attrib_names().sort(), ['position', 'h'].sort());
	assert.equal(container.points_count(), 4);
	assert.equal(
		(core_group.objects_with_geo()[0].geometry.attributes['h'].array as number[]).join(''),
		[0, 1, 2, 3].join('')
	);

	container = await skin1.request_container();
	core_group = container.core_content()!;
	assert.equal(container.points_count(), 4);
	assert.deepEqual(core_group.attrib_names().sort(), ['normal', 'position', 'h'].sort());

	container = await attrib_copy1.request_container();
	core_group = container.core_content()!;
	assert.equal(container.points_count(), 4);
	assert.deepEqual(core_group.attrib_names().sort(), ['normal', 'position', 'h'].sort());
	assert.equal(
		(core_group.objects_with_geo()[0].geometry.attributes['h'].array as number[]).join(''),
		[0, 1, 2, 3].join('')
	);
});

QUnit.skip('skin simple with 3 curves', async (assert) => {
	const geo1 = window.geo1;

	const line1 = geo1.createNode('line');
	const line2 = geo1.createNode('line');
	const line3 = geo1.createNode('line');
	const merge1 = geo1.createNode('merge');
	const skin1 = geo1.createNode('skin');

	merge1.setInput(0, line1);
	merge1.setInput(1, line2);
	merge1.setInput(2, line3);
	skin1.setInput(0, merge1);

	let container;
	container = await merge1.request_container();
	assert.equal(container.points_count(), 6);

	container = await skin1.request_container();
	assert.equal(container.points_count(), 8);
});
