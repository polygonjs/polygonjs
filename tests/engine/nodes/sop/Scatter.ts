QUnit.test('scatter simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const scatter1 = geo1.createNode('scatter');

	scatter1.setInput(0, plane1);

	let container;

	container = await scatter1.compute();
	assert.equal(container.pointsCount(), 100);

	scatter1.p.pointsCount.set(1000);
	container = await scatter1.compute();
	assert.equal(container.pointsCount(), 1000);
});

QUnit.test('scatter takes into account the transform of objects', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const add = geo1.createNode('add');
	const copy = geo1.createNode('copy');
	copy.setInput(0, plane1);
	copy.setInput(1, add);
	const scatter1 = geo1.createNode('scatter');
	scatter1.setInput(0, copy);
	scatter1.p.pointsCount.set(1);

	let container;

	container = await scatter1.compute();
	assert.in_delta(container.coreContent()!.points()[0].position().x, 0.026, 0.01);

	add.p.position.x.set(5);
	container = await scatter1.compute();
	assert.in_delta(container.coreContent()!.points()[0].position().x, 5.026, 0.01);
});
