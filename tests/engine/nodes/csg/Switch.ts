import {BufferAttribute, Box3} from 'three';
const tmpBox = new Box3();

QUnit.test('csg/switch', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const cube1 = csgNetwork1.createNode('cube');
	const sphere1 = csgNetwork1.createNode('sphere');
	const switch1 = csgNetwork1.createNode('switch');

	switch1.setInput(0, cube1);
	switch1.setInput(1, sphere1);
	switch1.flags.display.set(true);

	switch1.p.input.set(0);
	await csgNetwork1.compute();
	let container = await csgNetwork1.compute();
	let core_group = container.coreContent();
	let geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 108);
	container.boundingBox(tmpBox);
	assert.in_delta(tmpBox.min.x, -0.5, 0.002);
	assert.in_delta(tmpBox.max.x, 0.5, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');

	switch1.p.input.set(1);
	await csgNetwork1.compute();
	container = await csgNetwork1.compute();
	core_group = container.coreContent();
	geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 2016);
	container.boundingBox(tmpBox);
	assert.in_delta(tmpBox.min.x, -1, 0.002);
	assert.in_delta(tmpBox.max.x, 1, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
});
