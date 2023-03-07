// import {BufferAttribute, Box3} from 'three';
// const tmpBox = new Box3();

// QUnit.test('csg/offset on 2d prim', async (assert) => {
// 	const geo1 = window.geo1;
// 	geo1.flags.display.set(false); // cancels geo node displayNodeController

// 	const csgNetwork1 = geo1.createNode('csgNetwork');
// 	const arc1 = csgNetwork1.createNode('arc');
// 	const offset1 = csgNetwork1.createNode('offset');

// 	offset1.setInput(0, arc1);
// 	offset1.p.delta.set(0.1);
// 	offset1.flags.display.set(true);

// 	let container = await csgNetwork1.compute();
// 	let core_group = container.coreContent();
// 	assert.equal(core_group?.threejsObjectsWithGeo().length, 1, '1 object');
// 	let geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
// 	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 102);
// 	container.boundingBox(tmpBox);
// 	assert.in_delta(tmpBox.min.x, -1.099, 0.002);
// 	assert.in_delta(tmpBox.max.x, 1.099, 0.002);
// 	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');

// 	offset1.p.delta.set(0.1);
// 	container = await csgNetwork1.compute();
// 	core_group = container.coreContent();
// 	assert.equal(core_group?.threejsObjectsWithGeo().length, 1, '1 object');
// 	geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
// 	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 102);
// 	container.boundingBox(tmpBox);
// 	assert.in_delta(tmpBox.min.x, -1.099, 0.002);
// 	assert.in_delta(tmpBox.max.x, 1.099, 0.002);
// 	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
// });

// QUnit.test('csg/offset on 3d prim', async (assert) => {
// 	const geo1 = window.geo1;
// 	geo1.flags.display.set(false); // cancels geo node displayNodeController

// 	const csgNetwork1 = geo1.createNode('csgNetwork');
// 	const cube1 = csgNetwork1.createNode('cube');
// 	const offset1 = csgNetwork1.createNode('offset');

// 	offset1.setInput(0, cube1);
// 	offset1.p.delta.set(0.1);
// 	offset1.flags.display.set(true);

// 	let container = await csgNetwork1.compute();
// 	const core_group = container.coreContent();
// 	assert.equal(core_group?.threejsObjectsWithGeo().length, 1, '1 object');
// 	let geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
// 	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 108);
// 	container.boundingBox(tmpBox);
// 	assert.in_delta(tmpBox.min.x, -0.5, 0.002);
// 	assert.in_delta(tmpBox.max.x, 0.5, 0.002);
// 	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
// });
