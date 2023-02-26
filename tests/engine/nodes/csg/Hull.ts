import { BufferAttribute } from "three";

QUnit.test('csg/hull', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const cube1 = csgNetwork1.createNode('cube');
	const sphere1 = csgNetwork1.createNode('sphere');
	const merge1 = csgNetwork1.createNode('merge');
	const hull1 = csgNetwork1.createNode('hull');

	merge1.setInput(0, cube1);
	merge1.setInput(1, sphere1);
	hull1.setInput(0, merge1);
	cube1.p.sizes.x.set(5);
	hull1.flags.display.set(true);

	let container = await csgNetwork1.compute();
	const core_group = container.coreContent();
	assert.equal(core_group?.objectsWithGeo().length, 1, '1 object');
	let geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 1116);
	assert.in_delta(container.boundingBox().min.x, -2.5, 0.002);
	assert.in_delta(container.boundingBox().max.x, 2.5, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
});
