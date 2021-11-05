QUnit.test('rounded_box simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const rounded_box1 = geo1.createNode('roundedBox');

	let container = await rounded_box1.compute();
	let core_group = container.coreContent();
	let geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 2700);
	assert.equal(container.boundingBox().min.y, -0.5);
	assert.notOk(rounded_box1.isDirty(), 'box is dirty');

	rounded_box1.p.size.set([2, 2, 2]);
	assert.ok(rounded_box1.isDirty(), 'box is dirty');
	container = await rounded_box1.compute();
	assert.ok(!rounded_box1.isDirty(), 'box is not dirty anymore');
	assert.equal(container.boundingBox().min.y, -1.0);

	rounded_box1.p.divisions.set(10);
	container = await rounded_box1.compute();
	core_group = container.coreContent();
	geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 47628);
});

QUnit.test('rounded_box with input', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const rounded_box1 = geo1.createNode('roundedBox');
	const transform1 = geo1.createNode('transform');
	transform1.io.inputs.setInput(0, rounded_box1);

	const rounded_box2 = geo1.createNode('roundedBox');
	assert.ok(rounded_box2.isDirty());
	let container;
	await rounded_box2.compute();
	assert.notOk(rounded_box2.isDirty());
	rounded_box2.io.inputs.setInput(0, transform1);
	assert.ok(rounded_box2.isDirty());
	await rounded_box2.compute();
	assert.notOk(rounded_box2.isDirty());

	transform1.p.scale.set(3);
	assert.ok(rounded_box2.isDirty());

	container = await rounded_box2.compute();
	const group = container.coreContent()!;
	const {geometry} = group.objectsWithGeo()[0];

	assert.equal(geometry.getAttribute('position').array.length, 2700);
	assert.equal(container.boundingBox().min.y, -1.5);
});
