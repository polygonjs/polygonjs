QUnit.test('center simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const transform1 = geo1.create_node('transform');
	const center1 = geo1.create_node('center');

	transform1.set_input(0, box1);
	transform1.p.t.set([1, 3, 4]);
	center1.set_input(0, transform1);

	let container = await center1.request_container();
	const geometry = container.core_content()!.objects_with_geo()[0].geometry;
	const positions = geometry.getAttribute('position').array as number[];
	assert.deepEqual(positions.join(','), [1, 3, 4].join(','));
});
