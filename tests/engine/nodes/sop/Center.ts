QUnit.test('center simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const center1 = geo1.createNode('center');

	transform1.set_input(0, box1);
	transform1.p.t.set([1, 3, 4]);
	center1.set_input(0, transform1);

	let container = await center1.request_container();
	const geometry = container.core_content()!.objects_with_geo()[0].geometry;
	const positions = geometry.getAttribute('position').array as number[];
	assert.deepEqual(positions.join(','), [1, 3, 4].join(','));
});

QUnit.test('center with multiple objects', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const transform2 = geo1.createNode('transform');
	const merge = geo1.createNode('merge');
	const center1 = geo1.createNode('center');

	transform1.set_input(0, box1);
	transform2.set_input(0, box2);
	transform1.p.t.set([1, 3, 4]);
	transform2.p.t.set([-1, 5, 2]);
	merge.set_input(0, transform1);
	merge.set_input(1, transform2);
	merge.p.compact.set(0);
	center1.set_input(0, merge);

	let container = await center1.request_container();
	const geometry = container.core_content()!.objects_with_geo()[0].geometry;
	const positions = geometry.getAttribute('position').array as number[];
	assert.deepEqual(positions.join(','), [1, 3, 4, -1, 5, 2].join(','));
});
