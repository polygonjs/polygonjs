QUnit.test('object_merge simple', async (assert) => {
	const geo1 = window.geo1;
	const geo2 = window.scene.root.createNode('geo');

	const plane1 = geo2.createNode('plane');
	const object_merge1 = geo1.createNode('object_merge');

	console.log('plane1.full_path()', plane1.full_path());
	object_merge1.p.geometry.set(plane1.full_path());
	console.log(object_merge1.p.geometry.value);
	console.log(object_merge1.pv.geometry);

	let container;

	container = await object_merge1.request_container();
	assert.equal(container.points_count(), 4);
});
