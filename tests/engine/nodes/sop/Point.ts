QUnit.test('point without expressions', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	plane1.p.direction.set([0, 1, 0]);
	// const transform1 = geo1.createNode('transform');
	// transform1.set_input(0, plane1);
	// transform1.param('rx').set(90);

	let container = await plane1.request_container();
	let bbox = container.bounding_box();
	assert.vector3_in_delta(bbox.min, [-0.5, 0, -0.5]);
	assert.vector3_in_delta(bbox.max, [0.5, 0, 0.5]);

	const point1 = geo1.createNode('point');
	assert.equal(point1.dirty_controller.dirty_count, 0);

	point1.set_input(0, plane1);
	assert.equal(point1.dirty_controller.dirty_count, 1);
	point1.p.update_y.set(1);
	point1.p.y.set(1);
	assert.equal(point1.dirty_controller.dirty_count, 3);

	container = await point1.request_container();

	assert.equal(point1.dirty_controller.dirty_count, 3);
	// const core_group = container.core_content()!;
	// const {geometry} = core_group.objects()[0];

	bbox = container.bounding_box();
	assert.deepEqual(bbox.min.toArray(), [-0.5, 1, -0.5]);
	assert.deepEqual(bbox.max.toArray(), [0.5, 1, 0.5]);
});

QUnit.test('point with expression based on @P.x', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const transform1 = geo1.createNode('transform');
	transform1.set_input(0, plane1);
	// transform1.param('rx').set(90);

	const point1 = geo1.createNode('point');
	point1.set_input(0, transform1);
	point1.p.update_y.set(1);
	point1.p.y.set('sin(@P.x)');

	let container = await point1.request_container();
	// const core_group = container.core_content();
	// const {geometry} = core_group.objects()[0];

	const bbox = container.bounding_box();
	assert.equal(bbox.min.x, -0.5);
	assert.in_delta(bbox.min.y, -0.5, 0.1);
	assert.equal(bbox.min.z, -0.5);
	assert.equal(bbox.max.x, 0.5);
	assert.in_delta(bbox.max.y, 0.5, 0.1);
	assert.equal(bbox.max.z, 0.5);
});

QUnit.test('point with inverting @P.x and @P.z', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	plane1.p.size.x.set(4);
	const point1 = geo1.createNode('point');
	point1.set_input(0, plane1);

	let container, bbox;
	container = await point1.request_container();
	bbox = container.bounding_box();
	assert.deepEqual([bbox.min.x, bbox.max.x], [-2, 2]);
	assert.deepEqual([bbox.min.z, bbox.max.z], [-0.5, 0.5]);

	point1.p.update_x.set(1);
	point1.p.update_z.set(1);
	point1.p.x.set('@P.z');
	point1.p.z.set('@P.x');
	container = await point1.request_container();
	bbox = container.bounding_box();
	assert.deepEqual([bbox.min.x, bbox.max.x], [-0.5, 0.5]);
	assert.deepEqual([bbox.min.z, bbox.max.z], [-2, 2]);
});

QUnit.skip('point with expression based on @Cd.r', () => {});
QUnit.skip('point with expression based on @ptnum', () => {});
