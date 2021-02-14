QUnit.test('box simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');

	let container = await box1.requestContainer();
	const core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 72);
	assert.equal(container.boundingBox().min.y, -0.5);
	assert.notOk(box1.isDirty(), 'box is dirty');

	box1.p.size.set(2);
	assert.ok(box1.isDirty(), 'box is dirty');
	container = await box1.requestContainer();
	assert.ok(!box1.isDirty(), 'box is not dirty anymore');
	assert.equal(container.boundingBox().min.y, -1.0);
});

QUnit.test('box with input', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.io.inputs.setInput(0, box1);

	const box2 = geo1.createNode('box');
	assert.ok(box2.isDirty());
	let container;
	await box2.requestContainer();
	assert.notOk(box2.isDirty());
	box2.io.inputs.setInput(0, transform1);
	assert.ok(box2.isDirty());
	await box2.requestContainer();
	assert.notOk(box2.isDirty());

	transform1.p.scale.set(3);
	assert.ok(box2.isDirty());

	container = await box2.requestContainer();
	const group = container.coreContent()!;
	const {geometry} = group.objectsWithGeo()[0];

	assert.equal(geometry.getAttribute('position').array.length, 72);
	assert.equal(container.boundingBox().min.y, -1.5);
});

QUnit.test('box with expression', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	let container;
	const box1 = geo1.createNode('box');

	container = await box1.requestContainer();
	assert.equal(container.boundingBox().min.y, -0.5);

	box1.p.size.set('1+1');
	assert.ok(box1.p.size.isDirty(), 'size is dirty');
	await box1.p.size.compute();
	assert.equal(box1.pv.size, 2);
	container = await box1.requestContainer();
	assert.equal(container.boundingBox().min.y, -1);

	box1.p.size.set('2*3');
	container = await box1.requestContainer();
	assert.equal(container.boundingBox().min.y, -3);

	box1.p.size.set('$PI');
	container = await box1.requestContainer();
	assert.in_delta(container.boundingBox().min.y, -1.57, 0.1);

	// with an invalid value
	assert.notOk(box1.states.error.active());
	box1.p.size.set('1+');
	await box1.p.size.compute();
	assert.ok(box1.p.size.states.error.active(), 'check param is errored');

	// with $F
	scene.setFrame(5);
	box1.p.size.set('$F');
	assert.notOk(box1.states.error.active());
	await box1.p.size.compute();
	assert.equal(box1.pv.size, 5);
	container = await box1.requestContainer();
	assert.equal(container.boundingBox().min.y, -2.5);

	assert.notOk(box1.p.size.isDirty());
	assert.notOk(box1.isDirty());
	scene.setFrame(10);
	assert.ok(box1.p.size.isDirty());
	assert.ok(box1.isDirty());
	await box1.p.size.compute();
	assert.equal(box1.pv.size, 10);
	container = await box1.requestContainer();
	assert.equal(container.boundingBox().min.y, -5);

	scene.setFrame(20);
	container = await box1.requestContainer();
	assert.equal(container.boundingBox().min.y, -10);

	box1.p.size.set('$F+1');
	container = await box1.requestContainer();
	assert.equal(container.boundingBox().min.y, -10.5);
});
