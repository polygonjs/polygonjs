import {BufferAttribute} from 'three';

QUnit.test('csg/rotate', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const cube1 = csgNetwork1.createNode('cube');
	const rotate1 = csgNetwork1.createNode('rotate');

	rotate1.setInput(0, cube1);
	rotate1.p.r.z.set(45);
	rotate1.flags.display.set(true);

	let container = await csgNetwork1.compute();
	let core_group = container.coreContent();
	assert.equal(core_group?.objectsWithGeo().length, 1, '1 object');
	let geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 108);
	assert.in_delta(container.boundingBox().min.x, -0.707, 0.002);
	assert.in_delta(container.boundingBox().max.x, 0.707, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
});
