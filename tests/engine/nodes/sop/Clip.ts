QUnit.test('clip simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const BVH1 = geo1.createNode('BVH');
	const clip1 = geo1.createNode('clip');
	BVH1.setInput(0, box1);
	clip1.setInput(0, BVH1);

	let container = await clip1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 48);
});
