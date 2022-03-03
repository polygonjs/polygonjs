import {CorePoint} from '../../../../src/core/geometry/Point';

QUnit.test('scatter simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const scatter1 = geo1.createNode('scatter');

	scatter1.setInput(0, plane1);

	let container;

	container = await scatter1.compute();
	assert.equal(container.pointsCount(), 100);

	scatter1.p.pointsCount.set(1000);
	container = await scatter1.compute();
	assert.equal(container.pointsCount(), 1000);
});

QUnit.test('scatter takes into account the transform of objects', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const add = geo1.createNode('add');
	const copy = geo1.createNode('copy');
	copy.setInput(0, plane1);
	copy.setInput(1, add);
	const scatter1 = geo1.createNode('scatter');
	scatter1.setInput(0, copy);
	scatter1.p.pointsCount.set(1);

	let container = await scatter1.compute();
	let object = container.coreContent()!.objectsWithGeo()[0];
	let firstPt = container.coreContent()!.points()[0];
	assert.equal(object.position.x, 0);
	assert.in_delta(firstPt.position().x, -0.23, 0.01);

	add.p.position.x.set(5);
	container = await scatter1.compute();
	object = container.coreContent()!.objectsWithGeo()[0];
	firstPt = container.coreContent()!.points()[0];
	assert.equal(object.position.x, 5);
	assert.in_delta(firstPt.position().x, -0.23, 0.01);
});

QUnit.test('scatter interpolates correctly a float attributes with value 0', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attribCreate1 = geo1.createNode('attribCreate');
	const scatter1 = geo1.createNode('scatter');
	attribCreate1.setInput(0, plane1);
	scatter1.setInput(0, attribCreate1);

	attribCreate1.p.name.set('delay');
	attribCreate1.p.size.set(1);
	attribCreate1.p.value1.set(0);
	scatter1.p.pointsCount.set(2);
	scatter1.p.transferAttributes.set(1);
	scatter1.p.attributesToTransfer.set('delay');

	let container = await scatter1.compute();
	assert.ok(!scatter1.states.error.active());
	function delayValues() {
		return container
			.coreContent()!
			.points()
			.map((p: CorePoint) => p.attribValue('delay'));
	}
	assert.deepEqual(delayValues(), [0, 0]);

	attribCreate1.p.value1.set(14.5);
	container = await scatter1.compute();
	assert.deepEqual(delayValues(), [14.5, 14.5]);

	attribCreate1.p.value1.set(-17);
	container = await scatter1.compute();
	assert.deepEqual(delayValues(), [-17, -17]);
});

QUnit.test(
	'scatter sets the buffer size correctly when transfering an attribute with size different than 3',
	async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const scatter1 = geo1.createNode('scatter');
		scatter1.setInput(0, plane1);

		scatter1.p.transferAttributes.set(1);
		scatter1.p.attributesToTransfer.set('uv');

		let container = await scatter1.compute();
		assert.ok(!scatter1.states.error.active());
		const geometry = container.coreContent()?.objectsWithGeo()[0].geometry;
		assert.ok(geometry);

		assert.equal(geometry?.getAttribute('uv').itemSize, 2);
		assert.equal(geometry?.getAttribute('uv').count, 100);
	}
);
