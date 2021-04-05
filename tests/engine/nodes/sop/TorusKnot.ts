QUnit.test('torus knot simple', async (assert) => {
	const geo1 = window.geo1;

	const torus_knot1 = geo1.createNode('torusKnot');

	let container = await torus_knot1.compute();
	const core_group = container.coreContent()!;
	const {geometry} = core_group.objectsWithGeo()[0];

	assert.ok(geometry);
	assert.equal(container.pointsCount(), 585);
});
