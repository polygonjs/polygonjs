QUnit.test('normals simple', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	sphere1.p.resolution.set([8, 6]);
	const noise1 = geo1.createNode('noise');
	const normals1 = geo1.createNode('normals');

	noise1.setInput(0, sphere1);
	normals1.setInput(0, noise1);

	noise1.p.computeNormals.set(0);
	noise1.p.octaves.set(1);

	let container, normal;

	container = await noise1.compute();
	normal = container.coreContent()!.points()[0].normal().toArray();
	assert.in_delta(normal[0], 0, 0.05);
	assert.in_delta(normal[1], 1, 0.05);
	assert.in_delta(normal[2], 0, 0.05);

	container = await normals1.compute();
	normal = container.coreContent()!.points()[0].normal().toArray();
	assert.in_delta(normal[0], 0.05, 0.05);
	assert.in_delta(normal[1], -0.95, 0.05);
	assert.in_delta(normal[2], -0.4, 0.05);

	normals1.p.invert.set(1);
	container = await normals1.compute();
	normal = container.coreContent()!.points()[0].normal().toArray();
	assert.in_delta(normal[0], -0.05, 0.05);
	assert.in_delta(normal[1], 0.95, 0.05);
	assert.in_delta(normal[2], 0.4, 0.05);
});
