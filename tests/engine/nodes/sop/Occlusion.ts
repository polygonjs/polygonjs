QUnit.test('occlusion simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const box2 = geo1.create_node('box');
	const merge1 = geo1.create_node('merge');
	const occlusion1 = geo1.create_node('occlusion');
	occlusion1.p.samples.set(1024);

	box1.p.center.x.set(0.6);
	box2.p.center.x.set(-0.6);

	merge1.set_input(0, box1);
	merge1.set_input(1, box2);
	occlusion1.set_input(0, merge1);

	let container;
	container = await occlusion1.request_container();
	let core_group = container.core_content()!;
	let {geometry} = core_group.objects()[0];

	const occlusion_array = geometry.getAttribute('occlusion').array;

	assert.equal(occlusion_array.length, 48);
	assert.in_delta(occlusion_array[0], 0.2, 0.1);
	assert.in_delta(occlusion_array[24], 0.5, 0.1);
});
