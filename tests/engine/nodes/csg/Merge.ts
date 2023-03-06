import {BufferAttribute,Box3} from 'three';
const tmpBox = new Box3()

QUnit.test('csg/merge', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const cube1 = csgNetwork1.createNode('cube');
	const sphere1 = csgNetwork1.createNode('sphere');
	const merge1 = csgNetwork1.createNode('merge');

	merge1.setInput(0, cube1);
	merge1.setInput(1, sphere1);
	merge1.flags.display.set(true);

	await csgNetwork1.compute();

	let container = await csgNetwork1.compute();
	const core_group = container.coreContent();
	assert.equal(core_group?.threejsObjectsWithGeo().length, 2, '2 objects');
	let geometry1 = core_group?.threejsObjectsWithGeo()[0].geometry;
	assert.equal((geometry1?.getAttribute('position') as BufferAttribute).array.length, 108);
	let geometry2 = core_group?.threejsObjectsWithGeo()[1].geometry;
	assert.equal((geometry2?.getAttribute('position') as BufferAttribute).array.length, 2016);
	container.boundingBox(tmpBox)
	assert.in_delta(tmpBox.min.x, -1, 0.002);
	assert.in_delta(tmpBox.max.x, 1, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
});
