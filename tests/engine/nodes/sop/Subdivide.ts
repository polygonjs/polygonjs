QUnit.test('subdivide simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const subdivide1 = geo1.createNode('subdivide');

	subdivide1.setInput(0, box1);

	let container = await subdivide1.requestContainer();
	console.log(subdivide1.states.error);
	let core_group = container.coreContent()!;
	assert.equal(core_group.pointsCount(), 144);

	subdivide1.p.subdivisions.set(3);
	container = await subdivide1.requestContainer();
	core_group = container.coreContent()!;
	assert.equal(core_group.pointsCount(), 2304);
});
