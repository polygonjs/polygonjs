import {DataType, DATA_TYPES} from '../../../../src/engine/nodes/sop/DataUrl';

QUnit.test('data_url json', async (assert) => {
	const geo1 = window.geo1;

	const data_url1 = geo1.createNode('dataUrl');

	let container;
	container = await data_url1.compute();
	assert.ok(!data_url1.isDirty());
	assert.equal(container.pointsCount(), 2);

	await window.scene.root().processQueue();

	data_url1.p.url.set('/examples/sop/data_url/default.json');
	container = await data_url1.compute();

	assert.ok(!data_url1.isDirty());
	assert.equal(container.pointsCount(), 8);

	data_url1.p.url.set('/examples/sop/data_url/basic.json');
	container = await data_url1.compute();

	assert.ok(!data_url1.isDirty());
	assert.equal(container.pointsCount(), 2);

	// and a non existing
	data_url1.p.url.set('/dataurl_doesnotexist.json');
	container = await data_url1.compute();

	assert.ok(!data_url1.isDirty());
	assert.equal(container.pointsCount(), 0);
	assert.equal(
		data_url1.states.error.message(),
		'could not load geometry from /dataurl_doesnotexist.json (SyntaxError: Unexpected token < in JSON at position 0)'
	);

	// restore it with a good url
	data_url1.p.url.set('/examples/sop/data_url/default.json');
	container = await data_url1.compute();
	assert.equal(container.pointsCount(), 8);
});

QUnit.test('data_url csv without reading names from file', async (assert) => {
	const geo1 = window.geo1;

	const data_url1 = geo1.createNode('dataUrl');
	data_url1.p.url.set('/examples/sop/data_url/without_attrib_names.csv');
	data_url1.p.dataType.set(DATA_TYPES.indexOf(DataType.CSV));
	data_url1.p.readAttribNamesFromFile.set(0);
	data_url1.p.attribNames.set('attr1 attr2 attr3');

	let container;
	container = await data_url1.compute();
	assert.ok(!data_url1.isDirty());
	assert.equal(container.pointsCount(), 2);
	const core_group = container.coreContent()!;
	const point0 = core_group.points()[0];
	const point1 = core_group.points()[1];
	assert.equal(point0.attribValue('attr1'), 1);
	assert.equal(point0.attribValue('attr2'), 2);
	assert.equal(point0.attribValue('attr3'), 3);
	assert.equal(point1.attribValue('attr1'), 5);
	assert.equal(point1.attribValue('attr2'), 6);
	assert.equal(point1.attribValue('attr3'), 7);
	const geometry = core_group.objectsWithGeo()[0].geometry;
	assert.deepEqual(geometry.attributes.position.array.length, 6);
	assert.deepEqual(geometry.attributes.attr1.array.length, 2);
	assert.deepEqual(geometry.attributes.attr2.array.length, 2);
	assert.deepEqual(geometry.attributes.attr3.array.length, 2);
	assert.deepEqual(Object.keys(geometry.attributes).sort(), ['attr1', 'attr2', 'attr3', 'position']);
});
QUnit.test('data_url csv with reading names from file', async (assert) => {
	const geo1 = window.geo1;

	const data_url1 = geo1.createNode('dataUrl');
	data_url1.p.url.set('/examples/sop/data_url/with_attrib_names.csv');
	data_url1.p.dataType.set(DATA_TYPES.indexOf(DataType.CSV));
	data_url1.p.readAttribNamesFromFile.set(1);

	let container = await data_url1.compute();
	assert.ok(!data_url1.isDirty());
	assert.equal(container.pointsCount(), 2);
	const core_group = container.coreContent()!;
	const point0 = core_group.points()[0];
	const point1 = core_group.points()[1];
	assert.equal(point0.attribValue('rot'), 1);
	assert.equal(point0.attribValue('scale'), 2);
	assert.equal(point0.attribValue('mult'), 3);
	assert.equal(point0.attribValue('add'), 4);
	assert.equal(point1.attribValue('rot'), 5);
	assert.equal(point1.attribValue('scale'), 6);
	assert.equal(point1.attribValue('mult'), 7);
	assert.equal(point1.attribValue('add'), 8);
	const geometry = core_group.objectsWithGeo()[0].geometry;
	assert.deepEqual(geometry.attributes.position.array.length, 6);
	assert.deepEqual(geometry.attributes.rot.array.length, 2);
	assert.deepEqual(geometry.attributes.scale.array.length, 2);
	assert.deepEqual(geometry.attributes.mult.array.length, 2);
	assert.deepEqual(geometry.attributes.add.array.length, 2);
	assert.deepEqual(Object.keys(geometry.attributes).sort(), ['rot', 'mult', 'add', 'position', 'scale'].sort());
});
QUnit.test('data_url csv with empty line', async (assert) => {
	const geo1 = window.geo1;

	const data_url1 = geo1.createNode('dataUrl');
	data_url1.p.url.set('/examples/sop/data_url/with_empty_line.csv');
	data_url1.p.dataType.set(DATA_TYPES.indexOf(DataType.CSV));
	data_url1.p.readAttribNamesFromFile.set(1);

	let container = await data_url1.compute();
	assert.ok(!data_url1.isDirty());
	assert.equal(container.pointsCount(), 2);
	const core_group = container.coreContent()!;
	const geometry = core_group.objectsWithGeo()[0].geometry;
	assert.deepEqual(geometry.attributes.position.array.length, 6);
	assert.deepEqual(geometry.attributes.rot.array.length, 2);
	assert.deepEqual(Object.keys(geometry.attributes).sort(), ['rot', 'mult', 'add', 'position', 'scale'].sort());
});
