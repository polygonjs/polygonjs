QUnit.test('scatter simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const scatter1 = geo1.createNode('scatter');

	scatter1.setInput(0, plane1);

	let container;

	container = await scatter1.requestContainer();
	assert.equal(container.pointsCount(), 100);

	scatter1.p.pointsCount.set(1000);
	container = await scatter1.requestContainer();
	assert.equal(container.pointsCount(), 1000);
});
