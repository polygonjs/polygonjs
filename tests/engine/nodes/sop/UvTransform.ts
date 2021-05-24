QUnit.test('UvTransform simple', async (assert) => {
	const geo1 = window.geo1;
	const plane = geo1.createNode('plane');
	const uvTransform = geo1.createNode('uvTransform');

	uvTransform.setInput(0, plane);
	uvTransform.p.s.set([0.5, 0.5]);
	uvTransform.p.pivot.set([0.5, 0.5]);

	let container = await uvTransform.compute();
	let core_group = container.coreContent()!;
	let geometry0 = core_group.objectsWithGeo()[0].geometry;
	assert.deepEqual(
		(geometry0.getAttribute('uv').array as number[]).join(','),
		[-0.25, 0.25, 0.25, 0.25, -0.25, -0.25, 0.25, -0.25].join(',')
	);
});
