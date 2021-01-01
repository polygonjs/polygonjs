QUnit.test('draw range simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const draw_range1 = geo1.createNode('drawRange');

	draw_range1.setInput(0, box1);

	let container = await draw_range1.requestContainer();
	let core_group = container.coreContent()!;
	assert.deepEqual(core_group.geometries()[0].drawRange, {start: 0, count: Infinity});

	draw_range1.p.use_count.set(1);
	container = await draw_range1.requestContainer();
	core_group = container.coreContent()!;
	assert.deepEqual(core_group.geometries()[0].drawRange, {start: 0, count: 0});

	draw_range1.p.count.set(100);
	container = await draw_range1.requestContainer();
	core_group = container.coreContent()!;
	assert.deepEqual(core_group.geometries()[0].drawRange, {start: 0, count: 100});

	draw_range1.p.start.set(5);
	container = await draw_range1.requestContainer();
	core_group = container.coreContent()!;
	assert.deepEqual(core_group.geometries()[0].drawRange, {start: 5, count: 100});
});
