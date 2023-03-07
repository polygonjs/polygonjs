// import {BufferAttribute, Box3} from 'three';
// const tmpBox = new Box3();

// QUnit.test('csg/copy simple', async (assert) => {
// 	const geo1 = window.geo1;
// 	geo1.flags.display.set(false); // cancels geo node displayNodeController

// 	const csgNetwork1 = geo1.createNode('csgNetwork');
// 	const sphere1 = csgNetwork1.createNode('sphere');
// 	const copy1 = csgNetwork1.createNode('copy');

// 	copy1.setInput(0, sphere1);
// 	copy1.flags.display.set(true);

// 	copy1.p.count.set(4);
// 	copy1.p.t.x.set(2);

// 	let container = await csgNetwork1.compute();
// 	const core_group = container.coreContent();
// 	const geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
// 	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 2016);
// 	container.boundingBox(tmpBox);
// 	assert.in_delta(tmpBox.min.x, -1, 0.002);
// 	assert.in_delta(tmpBox.max.x, 7, 0.002);
// 	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
// });

// QUnit.test('csg/copy with copy expr', async (assert) => {
// 	const geo1 = window.geo1;
// 	geo1.flags.display.set(false); // cancels geo node displayNodeController

// 	const csgNetwork1 = geo1.createNode('csgNetwork');
// 	const sphere1 = csgNetwork1.createNode('sphere');
// 	const copy1 = csgNetwork1.createNode('copy');

// 	copy1.setInput(0, sphere1);
// 	copy1.flags.display.set(true);

// 	copy1.p.count.set(4);
// 	copy1.p.t.x.set(2);
// 	sphere1.p.radius.set(`1/(1+copy('../copy1'))`);

// 	let container = await csgNetwork1.compute();
// 	const core_group = container.coreContent();
// 	const geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
// 	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 2016);
// 	container.boundingBox(tmpBox);
// 	assert.in_delta(tmpBox.min.x, -1, 0.002);
// 	assert.in_delta(tmpBox.max.x, 6.25, 0.002);
// 	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
// });
