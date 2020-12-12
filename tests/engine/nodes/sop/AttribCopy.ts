QUnit.test('attribcopy latitude to position', async (assert) => {
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');

	const attrib_create1 = geo1.createNode('attrib_create');
	attrib_create1.p.name.set('latitude');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum');
	attrib_create1.set_input(0, plane1);

	const attrib_create2 = geo1.createNode('attrib_create');
	attrib_create2.p.name.set('longitude');
	attrib_create2.p.size.set(1);
	attrib_create2.p.value1.set('2*@ptnum+1');
	attrib_create2.set_input(0, attrib_create1);

	const attrib_copy1 = geo1.createNode('attrib_copy');
	attrib_copy1.set_input(0, attrib_create2);
	attrib_copy1.set_input(1, attrib_create2);

	attrib_copy1.p.name.set('latitude');
	attrib_copy1.p.tnew_name.set(1);
	attrib_copy1.p.new_name.set('position');
	// attrib_copy1.param('to_all_components').set(0);
	// attrib_copy1.param('src_component').set(0);
	// attrib_copy1.param('dest_component').set(0);

	let container = await attrib_copy1.request_container();
	assert.notOk(attrib_copy1.states.error.message, 'no error');
	let core_group = container.core_content()!;
	let geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(core_group, 'core group exists');
	assert.ok(geometry, 'geometry exists');
	console.log('geometry', geometry);

	let {array} = geometry.getAttribute('position');
	assert.equal(array.length, container.points_count() * 3, 'array is 3x the points count');
	console.log('array', array, array.length, container.points_count());
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[2], -0.5);
	assert.equal(array[5], -0.5);
	assert.equal(array[8], +0.5);

	const attrib_copy2 = geo1.createNode('attrib_copy');
	attrib_copy2.set_input(0, attrib_copy1);
	attrib_copy2.set_input(1, attrib_copy1);

	attrib_copy2.p.name.set('longitude');
	attrib_copy2.p.tnew_name.set(1);
	attrib_copy2.p.new_name.set('position');
	attrib_copy2.p.dest_offset.set(2);
	// attrib_copy2.param('to_all_components').set(0);
	// attrib_copy2.param('src_component').set(0);
	// attrib_copy2.param('dest_component').set(2);

	container = await attrib_copy2.request_container();
	assert.notOk(attrib_copy2.states.error.message);
	core_group = container.core_content()!;
	geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	array = geometry.getAttribute('position').array;
	assert.equal(array.length, container.points_count() * 3, 'array is 3x points_count');
	console.log('array', array);
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[2], 1);
	assert.equal(array[5], 3);
	assert.equal(array[8], 5);
});
