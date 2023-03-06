import {BufferAttribute, Box3} from 'three';
const tmpBox = new Box3();

QUnit.test('boxLines simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const boxLines1 = geo1.createNode('boxLines');
	async function getBbox() {
		const container = await boxLines1.compute();
		container.boundingBox(tmpBox);
		return tmpBox;
	}
	const container = await boxLines1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 144);
	assert.equal((await getBbox()).min.y, -0.5);
	assert.notOk(boxLines1.isDirty(), 'box is dirty');

	boxLines1.p.size.set(2);
	assert.ok(boxLines1.isDirty(), 'box is dirty');
	// container = await boxLines1.compute();
	assert.equal((await getBbox()).min.y, -1.0);
	assert.ok(!boxLines1.isDirty(), 'box is not dirty anymore');
});

QUnit.test('boxLines with input', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const boxLines1 = geo1.createNode('boxLines');
	const transform1 = geo1.createNode('transform');
	transform1.io.inputs.setInput(0, boxLines1);

	const box2 = geo1.createNode('boxLines');
	async function getBbox() {
		const container = await box2.compute();
		container.boundingBox(tmpBox);
		return tmpBox;
	}
	assert.ok(box2.isDirty());
	// let container;
	await box2.compute();
	assert.notOk(box2.isDirty());
	box2.io.inputs.setInput(0, transform1);
	assert.ok(box2.isDirty());
	await box2.compute();
	assert.notOk(box2.isDirty());

	transform1.p.scale.set(3);
	assert.ok(box2.isDirty());

	const container = await box2.compute();
	const group = container.coreContent()!;
	const {geometry} = group.threejsObjectsWithGeo()[0];

	assert.equal((geometry.getAttribute('position') as BufferAttribute).array.length, 144);
	assert.equal((await getBbox()).min.y, -1.5);
});

QUnit.test('boxLines with expression', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	// let container;
	const boxLines1 = geo1.createNode('boxLines');
	async function getBbox() {
		const container = await boxLines1.compute();
		container.boundingBox(tmpBox);
		return tmpBox;
	}

	// container = await boxLines1.compute();
	assert.equal((await getBbox()).min.y, -0.5);

	boxLines1.p.size.set('1+1');
	assert.ok(boxLines1.p.size.isDirty(), 'size is dirty');
	await boxLines1.p.size.compute();
	assert.equal(boxLines1.pv.size, 2);
	// container = await boxLines1.compute();
	assert.equal((await getBbox()).min.y, -1);

	boxLines1.p.size.set('2*3');
	// container = await boxLines1.compute();
	assert.equal((await getBbox()).min.y, -3);

	boxLines1.p.size.set('$PI');
	// container = await boxLines1.compute();
	assert.in_delta((await getBbox()).min.y, -1.57, 0.1);

	// with an invalid value
	assert.notOk(boxLines1.states.error.active());
	boxLines1.p.size.set('1+');
	await boxLines1.p.size.compute();
	assert.ok(boxLines1.p.size.states.error.active(), 'check param is errored');

	// with $F
	scene.setFrame(5);
	boxLines1.p.size.set('$F');
	assert.notOk(boxLines1.states.error.active());
	await boxLines1.p.size.compute();
	assert.equal(boxLines1.pv.size, 5);
	// container = await boxLines1.compute();
	assert.equal((await getBbox()).min.y, -2.5);

	assert.notOk(boxLines1.p.size.isDirty());
	assert.notOk(boxLines1.isDirty());
	scene.setFrame(10);
	assert.ok(boxLines1.p.size.isDirty());
	assert.ok(boxLines1.isDirty());
	await boxLines1.p.size.compute();
	assert.equal(boxLines1.pv.size, 10);
	// container = await boxLines1.compute();
	assert.equal((await getBbox()).min.y, -5);

	scene.setFrame(20);
	// container = await boxLines1.compute();
	assert.equal((await getBbox()).min.y, -10);

	boxLines1.p.size.set('$F+1');
	// container = await boxLines1.compute();
	assert.equal((await getBbox()).min.y, -10.5);
});
