import {BufferAttribute} from 'three';

QUnit.test('icosahedron simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const icosahedron1 = geo1.createNode('icosahedron');
	icosahedron1.p.pointsOnly.set(0);

	let container = await icosahedron1.compute();
	let core_group = container.coreContent();
	let geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 180);
	assert.notOk(icosahedron1.isDirty(), 'box is dirty');

	icosahedron1.p.detail.set(2);
	assert.ok(icosahedron1.isDirty(), 'node is dirty');
	container = await icosahedron1.compute();
	assert.ok(!icosahedron1.isDirty(), 'node is not dirty anymore');
	assert.equal(container.coreContent()?.pointsCount(), 540);

	icosahedron1.p.detail.set(44);
	assert.ok(icosahedron1.isDirty(), 'node is dirty');
	container = await icosahedron1.compute();
	assert.equal(container.coreContent()?.pointsCount(), 121500);

	icosahedron1.p.pointsOnly.set(1);
	icosahedron1.p.detail.set(0);

	container = await icosahedron1.compute();
	core_group = container.coreContent();
	geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 36);
	assert.notOk(icosahedron1.isDirty(), 'box is dirty');

	icosahedron1.p.detail.set(2);
	assert.ok(icosahedron1.isDirty(), 'node is dirty');
	container = await icosahedron1.compute();
	assert.ok(!icosahedron1.isDirty(), 'node is not dirty anymore');
	assert.equal(container.coreContent()?.pointsCount(), 128);

	icosahedron1.p.detail.set(44);
	assert.ok(icosahedron1.isDirty(), 'node is dirty');
	container = await icosahedron1.compute();
	assert.equal(container.coreContent()?.pointsCount(), 20744);
});
