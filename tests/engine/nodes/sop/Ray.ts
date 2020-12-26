QUnit.test('ray from normal', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const sphere1 = geo1.createNode('sphere');
	const transform1 = geo1.createNode('transform');
	const ray1 = geo1.createNode('ray');

	transform1.p.scale.set(0.2);

	transform1.setInput(0, sphere1);
	ray1.setInput(0, transform1);
	ray1.setInput(1, box1);

	let container, size;

	container = await ray1.request_container();
	size = container.size().toArray();
	assert.in_delta(size[0], 1, 0.1);
	assert.in_delta(size[1], 1, 0.1);
	assert.in_delta(size[2], 1, 0.1);
});

QUnit.test('ray from dir', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const sphere1 = geo1.createNode('sphere');
	const transform1 = geo1.createNode('transform');
	const transform2 = geo1.createNode('transform');
	const ray1 = geo1.createNode('ray');

	transform1.p.t.y.set(2);
	transform2.p.scale.set(5);
	ray1.p.use_normals.set(0);

	transform1.setInput(0, sphere1);
	transform2.setInput(0, plane1);
	ray1.setInput(0, transform1);
	ray1.setInput(1, transform2);

	let container, size;

	container = await ray1.request_container();
	size = container.size().toArray();
	assert.in_delta(size[0], 2, 0.1);
	assert.in_delta(size[1], 0, 0.1);
	assert.in_delta(size[2], 2, 0.1);
});
