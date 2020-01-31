QUnit.test('normals simple', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.create_node('sphere');
	const noise1 = geo1.create_node('noise');
	const normals1 = geo1.create_node('normals');

	noise1.set_input(0, sphere1);
	normals1.set_input(0, noise1);

	noise1.p.compute_normals.set(0);
	noise1.p.octaves.set(1);

	let container, normal;

	container = await noise1.request_container();
	normal = container
		.core_content()!
		.points()[0]
		.normal()
		.toArray();
	assert.in_delta(normal[0], 0, 0.05);
	assert.in_delta(normal[1], 1, 0.05);
	assert.in_delta(normal[2], 0, 0.05);

	container = await normals1.request_container();
	normal = container
		.core_content()!
		.points()[0]
		.normal()
		.toArray();
	assert.in_delta(normal[0], 0.05, 0.05);
	assert.in_delta(normal[1], -0.95, 0.05);
	assert.in_delta(normal[2], -0.4, 0.05);

	normals1.p.invert.set(1);
	container = await normals1.request_container();
	normal = container
		.core_content()!
		.points()[0]
		.normal()
		.toArray();
	assert.in_delta(normal[0], -0.05, 0.05);
	assert.in_delta(normal[1], 0.95, 0.05);
	assert.in_delta(normal[2], 0.4, 0.05);
});
