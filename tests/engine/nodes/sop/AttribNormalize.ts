import {NormalizeMode} from '../../../../src/core/operations/sop/AttribNormalize';

QUnit.test('attrib normalize simple float', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const plane2 = geo1.createNode('plane');
	const plane3 = geo1.createNode('plane');

	const attrib_create1 = geo1.createNode('attribCreate');
	const attrib_create2 = geo1.createNode('attribCreate');
	const attrib_create3 = geo1.createNode('attribCreate');
	attrib_create1.setInput(0, plane1);
	attrib_create2.setInput(0, plane2);
	attrib_create3.setInput(0, plane3);

	attrib_create1.p.name.set('blend');
	attrib_create2.p.name.set('blend');
	attrib_create3.p.name.set('blend');

	attrib_create1.p.value1.set(1);
	attrib_create2.p.value1.set(2);
	attrib_create3.p.value1.set(3);

	const merge1 = geo1.createNode('merge');
	const merge2 = geo1.createNode('merge');

	merge1.setInput(0, attrib_create1);
	merge1.setInput(1, attrib_create2);

	merge2.setInput(0, merge1);
	merge2.setInput(1, attrib_create3);

	let container = await merge2.request_container();
	let core_group = container.core_content()!;
	let geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(geometry);

	let array = geometry.getAttribute('blend').array as number[];
	assert.equal(array.length, 12);
	assert.equal(array.join(','), [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3].join(','));

	const attrib_normalize1 = geo1.createNode('attribNormalize');
	attrib_normalize1.setInput(0, merge2);
	attrib_normalize1.p.name.set('blend');

	container = await attrib_normalize1.request_container();
	core_group = container.core_content()!;
	geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(geometry);

	array = geometry.getAttribute('blend').array as number[];
	assert.equal(array.length, 12);
	assert.equal(array.join(','), [0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1].join(','));
});

QUnit.skip('attrib normalize simple float when all points have same value', (assert) => {});

QUnit.test('attrib normalize simple vector', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const plane2 = geo1.createNode('plane');
	const plane3 = geo1.createNode('plane');

	const attrib_create1 = geo1.createNode('attribCreate');
	const attrib_create2 = geo1.createNode('attribCreate');
	const attrib_create3 = geo1.createNode('attribCreate');
	attrib_create1.setInput(0, plane1);
	attrib_create2.setInput(0, plane2);
	attrib_create3.setInput(0, plane3);

	attrib_create1.p.name.set('blend');
	attrib_create2.p.name.set('blend');
	attrib_create3.p.name.set('blend');
	attrib_create1.p.size.set(3);
	attrib_create2.p.size.set(3);
	attrib_create3.p.size.set(3);
	attrib_create1.p.value3.set([1, 2, 3]);
	attrib_create2.p.value3.set([2, 3, 4]);
	attrib_create3.p.value3.set([3, 4, 5]);

	const merge1 = geo1.createNode('merge');
	const merge2 = geo1.createNode('merge');

	merge1.setInput(0, attrib_create1);
	merge1.setInput(1, attrib_create2);

	merge2.setInput(0, merge1);
	merge2.setInput(1, attrib_create3);

	let container = await merge2.request_container();
	let core_group = container.core_content()!;
	let geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(geometry);

	let array = geometry.getAttribute('blend').array as number[];
	assert.equal(array.length, 36);
	assert.equal(
		array.join(','),
		[
			1,
			2,
			3,
			1,
			2,
			3,
			1,
			2,
			3,
			1,
			2,
			3,
			2,
			3,
			4,
			2,
			3,
			4,
			2,
			3,
			4,
			2,
			3,
			4,
			3,
			4,
			5,
			3,
			4,
			5,
			3,
			4,
			5,
			3,
			4,
			5,
		].join(',')
	);

	const attrib_normalize1 = geo1.createNode('attribNormalize');
	attrib_normalize1.setInput(0, merge2);
	attrib_normalize1.p.name.set('blend');

	container = await attrib_normalize1.request_container();
	core_group = container.core_content()!;
	geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(geometry);

	array = geometry.getAttribute('blend').array as number[];
	assert.equal(array.length, 36);
	assert.equal(
		array.join(','),
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0.5,
			0.5,
			0.5,
			0.5,
			0.5,
			0.5,
			0.5,
			0.5,
			0.5,
			0.5,
			0.5,
			0.5,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
		].join(',')
	);

	attrib_create1.p.value3.set([1, 2, 3]);
	attrib_create2.p.value3.set([4, 2, 6]);
	attrib_create3.p.value3.set([9, 6, 3]);

	container = await attrib_normalize1.request_container();
	core_group = container.core_content()!;
	geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(geometry);

	array = geometry.getAttribute('blend').array as number[];
	assert.equal(array.length, 36);
	assert.equal(
		array.join(','),
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0.375,
			0,
			1,
			0.375,
			0,
			1,
			0.375,
			0,
			1,
			0.375,
			0,
			1,
			1,
			1,
			0,
			1,
			1,
			0,
			1,
			1,
			0,
			1,
			1,
			0,
		].join(',')
	);
});

QUnit.test('attrib normalize vector length', async (assert) => {
	const geo1 = window.geo1;

	const add1 = geo1.createNode('add');
	const transform1 = geo1.createNode('transform');
	const attrib_normalize1 = geo1.createNode('attribNormalize');

	transform1.setInput(0, add1);
	attrib_normalize1.setInput(0, transform1);

	add1.p.position.set([2, 0, 0]);
	transform1.p.scale.set(2);
	attrib_normalize1.set_mode(NormalizeMode.VECTOR_TO_LENGTH_1);

	let container = await attrib_normalize1.request_container();
	let geometry = container.core_content()!.objects_with_geo()[0].geometry;
	let array = geometry.getAttribute('position').array as number[];

	assert.equal(array.join(','), [1, 0, 0]);
});
