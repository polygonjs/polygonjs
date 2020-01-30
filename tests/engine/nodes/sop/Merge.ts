QUnit.test('merge simple', async (assert) => {
	const geo1 = window.geo1;

	const tube1 = geo1.create_node('tube');
	const box1 = geo1.create_node('box');
	const merge1 = geo1.create_node('merge');
	merge1.set_input(0, box1);

	let container = await merge1.request_container();
	assert.equal(container.points_count(), 24);

	merge1.set_input(1, tube1);
	container = await merge1.request_container();
	assert.equal(container.points_count(), 100);
});

QUnit.skip('merge geos with different attributes', (assert) => {
	const geo1 = window.geo1;
	// var done = assert.async();

	const sphere1 = geo1.create_node('sphere');
	const box1 = geo1.create_node('box');

	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.set_input(0, box1);
	attrib_create1.p.name.set('blend');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set(2);

	const attrib_create2 = geo1.create_node('attrib_create');
	attrib_create2.set_input(0, sphere1);
	attrib_create2.p.name.set('selected');
	attrib_create2.p.size.set(1);
	attrib_create2.p.value1.set(1);

	const merge1 = geo1.create_node('merge');
	merge1.set_input(0, attrib_create1);
	merge1.set_input(1, attrib_create2);

	// skip();
});
// attrib_create1.request_container (container)=>
// 	assert.equal _.keys(container.group().children[0].geometry.attributes).sort().join(':'), ['position', 'normal', 'uv', 'blend'].sort().join(':')

// 	attrib_create2.request_container (container)=>
// 		assert.equal _.keys(container.group().children[0].geometry.attributes).sort().join(':'), ['position', 'normal', 'uv', 'selected'].sort().join(':')

// 		merge1.request_container (container)=>
// 			assert.equal _.keys(container.group().children[0].geometry.attributes).sort().join(':'), ['position', 'normal', 'uv', 'blend', 'selected'].sort().join(':')

// 			assert.equal container.points_count(), 87

// 			done()
