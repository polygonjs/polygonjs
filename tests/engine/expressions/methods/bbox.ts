QUnit.test('expression bbox works with path', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	assert.equal(box1.name, 'box1');
	const box2 = geo1.createNode('box');

	box2.p.size.set(`bbox('../${box1.name}', 'min', 'x')`);

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, -0.5);
});

QUnit.test('expression bbox works with index', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	box1.p.size.set(10);
	assert.equal(box1.name, 'box1');
	const box2 = geo1.createNode('box');
	box2.setInput(0, box1);

	box2.p.divisions.set(`2*bbox(0, 'max', 'x')`);

	await box2.p.divisions.compute();
	assert.equal(box2.p.divisions.value, 10);
});

QUnit.test('expression bbox works without component', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	box1.p.size.set(25);
	assert.equal(box1.name, 'box1');
	const box2 = geo1.createNode('box');
	box2.setInput(0, box1);

	box2.p.divisions.set(`2*bbox(0, 'max').x`);

	await box2.p.divisions.compute();
	assert.equal(box2.p.divisions.value, 25);
});

QUnit.test('expression bbox works without vector name', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	box1.p.size.set(15);
	assert.equal(box1.name, 'box1');
	const box2 = geo1.createNode('box');
	box2.setInput(0, box1);

	box2.p.divisions.set(`2*bbox(0).max.x`);

	await box2.p.divisions.compute();
	assert.equal(box2.p.divisions.value, 15);
});
