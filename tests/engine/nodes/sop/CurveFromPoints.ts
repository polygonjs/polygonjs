QUnit.test('sop/curveFromPoints simple', async (assert) => {
	const geo1 = window.geo1;

	const add1 = geo1.createNode('add');
	const add2 = geo1.createNode('add');
	const add3 = geo1.createNode('add');
	const add4 = geo1.createNode('add');
	const merge1 = geo1.createNode('merge');
	const curveFromPoints1 = geo1.createNode('curveFromPoints');

	add1.p.position.set([0, 0, 0]);
	add2.p.position.set([2, 1, 3]);
	add3.p.position.set([12, 41, 62]);
	add4.p.position.set([-20, 120, -10]);

	merge1.setInput(0, add1);
	merge1.setInput(1, add2);
	merge1.setInput(2, add3);
	merge1.setInput(3, add4);
	merge1.setCompactMode(true);

	curveFromPoints1.setInput(0, merge1);

	let container = await curveFromPoints1.compute();
	let coreGroup = container.coreContent()!;
	const object = coreGroup.objectsWithGeo()[0];
	assert.ok(object.userData['path']);
	assert.equal(coreGroup.pointsCount(), 100);
});
