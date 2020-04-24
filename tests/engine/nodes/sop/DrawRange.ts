QUnit.test('draw range simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const draw_range1 = geo1.create_node('draw_range');

	draw_range1.set_input(0, box1);

	let container = await draw_range1.request_container();
	let core_group = container.core_content()!;
	assert.deepEqual(core_group.geometries()[0].drawRange, {start: 0, count: Infinity});

	draw_range1.p.use_count.set(1);
	container = await draw_range1.request_container();
	core_group = container.core_content()!;
	assert.deepEqual(core_group.geometries()[0].drawRange, {start: 0, count: 0});

	draw_range1.p.count.set(100);
	container = await draw_range1.request_container();
	core_group = container.core_content()!;
	assert.deepEqual(core_group.geometries()[0].drawRange, {start: 0, count: 100});

	draw_range1.p.start.set(5);
	container = await draw_range1.request_container();
	core_group = container.core_content()!;
	assert.deepEqual(core_group.geometries()[0].drawRange, {start: 5, count: 100});
});
