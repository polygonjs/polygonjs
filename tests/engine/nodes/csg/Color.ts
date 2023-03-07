// import {BufferAttribute} from 'three';

// QUnit.test('csg/color', async (assert) => {
// 	const geo1 = window.geo1;
// 	geo1.flags.display.set(false); // cancels geo node displayNodeController

// 	const csgNetwork1 = geo1.createNode('csgNetwork');
// 	const cube1 = csgNetwork1.createNode('cube');
// 	const color1 = csgNetwork1.createNode('color');

// 	color1.setInput(0, cube1);
// 	color1.flags.display.set(true);

// 	await csgNetwork1.compute();
// 	let container = await csgNetwork1.compute();
// 	let core_group = container.coreContent();
// 	let geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
// 	let attrib = geometry?.getAttribute('color') as BufferAttribute;
// 	assert.ok(attrib);
// 	assert.equal(attrib?.array[0], 1);
// 	assert.equal(attrib?.array[1], 1);
// 	assert.equal(attrib?.array[2], 1);

// 	color1.p.color.set([0, 0.5, 1]);
// 	await csgNetwork1.compute();
// 	container = await csgNetwork1.compute();
// 	core_group = container.coreContent();
// 	geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
// 	attrib = geometry?.getAttribute('color') as BufferAttribute;
// 	assert.ok(attrib);
// 	assert.equal(attrib?.array[0], 0);
// 	assert.equal(attrib?.array[1], 0.5);
// 	assert.equal(attrib?.array[2], 1);

// 	cube1.flags.display.set(true);
// 	container = await csgNetwork1.compute();
// 	core_group = container.coreContent();
// 	geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
// 	attrib = geometry?.getAttribute('color') as BufferAttribute;
// 	assert.ok(attrib);
// 	assert.equal(attrib?.array[0], 1);
// 	assert.equal(attrib?.array[1], 1);
// 	assert.equal(attrib?.array[2], 1);
// });
