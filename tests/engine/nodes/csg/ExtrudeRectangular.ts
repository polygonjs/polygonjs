// import {BufferAttribute,Box3} from 'three';
// const tmpBox = new Box3()

// QUnit.test('csg/extrudeRectangular with non closed shapes', async (assert) => {
// 	const geo1 = window.geo1;
// 	geo1.flags.display.set(false); // cancels geo node displayNodeController

// 	const csgNetwork1 = geo1.createNode('csgNetwork');
// 	const arc1 = csgNetwork1.createNode('arc');
// 	const extrudeRectangular1 = csgNetwork1.createNode('extrudeRectangular');

// 	extrudeRectangular1.setInput(0, arc1);
// 	extrudeRectangular1.flags.display.set(true);

// 	await csgNetwork1.compute();

// 	let container = await csgNetwork1.compute();
// 	const core_group = container.coreContent();
// 	const geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
// 	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 1260);
// 	container.boundingBox(tmpBox)
// 	assert.in_delta(tmpBox.min.x, -1.497, 0.002);
// 	assert.in_delta(tmpBox.max.x, 1.497, 0.002);
// 	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
// });

// QUnit.test('csg/extrudeRectangular with closed shapes', async (assert) => {
// 	const geo1 = window.geo1;
// 	geo1.flags.display.set(false); // cancels geo node displayNodeController

// 	const csgNetwork1 = geo1.createNode('csgNetwork');
// 	const circle1 = csgNetwork1.createNode('circle');
// 	const extrudeRectangular1 = csgNetwork1.createNode('extrudeRectangular');

// 	extrudeRectangular1.setInput(0, circle1);
// 	extrudeRectangular1.flags.display.set(true);

// 	let container = await csgNetwork1.compute();
// 	const core_group = container.coreContent();
// 	const geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
// 	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 2304);
// 	container.boundingBox(tmpBox)
// 	assert.in_delta(tmpBox.min.x, -1.502, 0.002);
// 	assert.in_delta(tmpBox.max.x, 1.502, 0.002);
// 	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
// });
