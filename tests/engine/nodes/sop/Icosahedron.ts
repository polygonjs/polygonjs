QUnit.test('icosahedron simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	const icosahedron1 = geo1.createNode('icosahedron');
	icosahedron1.p.points_only.set(0);

	let container = await icosahedron1.request_container();
	let core_group = container.core_content();
	let geometry = core_group?.objects_with_geo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 180);
	assert.notOk(icosahedron1.is_dirty, 'box is dirty');

	icosahedron1.p.detail.set(2);
	assert.ok(icosahedron1.is_dirty, 'node is dirty');
	container = await icosahedron1.request_container();
	assert.ok(!icosahedron1.is_dirty, 'node is not dirty anymore');
	assert.equal(container.core_content()?.points_count(), 540);

	icosahedron1.p.detail.set(44);
	assert.ok(icosahedron1.is_dirty, 'node is dirty');
	container = await icosahedron1.request_container();
	assert.equal(container.core_content()?.points_count(), 121500);

	icosahedron1.p.points_only.set(1);
	icosahedron1.p.detail.set(0);

	container = await icosahedron1.request_container();
	core_group = container.core_content();
	geometry = core_group?.objects_with_geo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 36);
	assert.notOk(icosahedron1.is_dirty, 'box is dirty');

	icosahedron1.p.detail.set(2);
	assert.ok(icosahedron1.is_dirty, 'node is dirty');
	container = await icosahedron1.request_container();
	assert.ok(!icosahedron1.is_dirty, 'node is not dirty anymore');
	assert.equal(container.core_content()?.points_count(), 128);

	icosahedron1.p.detail.set(44);
	assert.ok(icosahedron1.is_dirty, 'node is dirty');
	container = await icosahedron1.request_container();
	assert.equal(container.core_content()?.points_count(), 20744);
});
