import {Box3} from 'three';
const tmpBox = new Box3();
QUnit.test('sop/point without expressions', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	plane1.p.direction.set([0, 1, 0]);
	// const transform1 = geo1.createNode('transform');
	// transform1.setInput(0, plane1);
	// transform1.param('rx').set(90);

	let container = await plane1.compute();
	container.boundingBox(tmpBox);
	assert.vector3_in_delta(tmpBox.min, [-0.5, 0, -0.5]);
	assert.vector3_in_delta(tmpBox.max, [0.5, 0, 0.5]);

	const point1 = geo1.createNode('point');
	assert.equal(point1.dirtyController.dirtyCount(), 0);

	point1.setInput(0, plane1);
	assert.equal(point1.dirtyController.dirtyCount(), 1);
	point1.p.updateY.set(1);
	point1.p.y.set(1);
	assert.equal(point1.dirtyController.dirtyCount(), 3);

	container = await point1.compute();

	assert.equal(point1.dirtyController.dirtyCount(), 3);
	// const core_group = container.coreContent()!;
	// const {geometry} = core_group.objects()[0];

	container.boundingBox(tmpBox);
	assert.deepEqual(tmpBox.min.toArray(), [-0.5, 1, -0.5]);
	assert.deepEqual(tmpBox.max.toArray(), [0.5, 1, 0.5]);
});

QUnit.test('sop/point with non entity dependent expression', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, plane1);
	// transform1.param('rx').set(90);

	const point1 = geo1.createNode('point');
	point1.setInput(0, transform1);
	point1.p.updateY.set(1);
	point1.p.y.set('$T');

	let container = await point1.compute();
	container.boundingBox(tmpBox);
	assert.equal(tmpBox.min.x, -0.5);
	assert.in_delta(tmpBox.min.y, 0, 0.1);
	assert.equal(tmpBox.min.z, -0.5);
	assert.equal(tmpBox.max.x, 0.5);
	assert.in_delta(tmpBox.max.y, 0, 0.1);
	assert.equal(tmpBox.max.z, 0.5);

	scene.timeController.setTime(1);
	container = await point1.compute();
	container.boundingBox(tmpBox);
	assert.equal(tmpBox.min.x, -0.5);
	assert.in_delta(tmpBox.min.y, 1, 0.1);
	assert.equal(tmpBox.min.z, -0.5);
	assert.equal(tmpBox.max.x, 0.5);
	assert.in_delta(tmpBox.max.y, 1, 0.1);
	assert.equal(tmpBox.max.z, 0.5);
});

QUnit.test('sop/point with expression based on @P.x', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, plane1);
	// transform1.param('rx').set(90);

	const point1 = geo1.createNode('point');
	point1.setInput(0, transform1);
	point1.p.updateY.set(1);
	point1.p.y.set('sin(@P.x)');

	let container = await point1.compute();
	// const core_group = container.coreContent();
	// const {geometry} = core_group.objects()[0];

	container.boundingBox(tmpBox);
	assert.equal(tmpBox.min.x, -0.5);
	assert.in_delta(tmpBox.min.y, -0.5, 0.1);
	assert.equal(tmpBox.min.z, -0.5);
	assert.equal(tmpBox.max.x, 0.5);
	assert.in_delta(tmpBox.max.y, 0.5, 0.1);
	assert.equal(tmpBox.max.z, 0.5);
});

QUnit.test('sop/point with inverting @P.x and @P.z', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	plane1.p.size.x.set(4);
	const point1 = geo1.createNode('point');
	point1.setInput(0, plane1);

	let container = await point1.compute();
	container.boundingBox(tmpBox);
	assert.deepEqual([tmpBox.min.x, tmpBox.max.x], [-2, 2]);
	assert.deepEqual([tmpBox.min.z, tmpBox.max.z], [-0.5, 0.5]);

	point1.p.updateX.set(1);
	point1.p.updateZ.set(1);
	point1.p.x.set('@P.z');
	point1.p.z.set('@P.x');
	container = await point1.compute();
	container.boundingBox(tmpBox);
	assert.deepEqual([tmpBox.min.x, tmpBox.max.x], [-0.5, 0.5]);
	assert.deepEqual([tmpBox.min.z, tmpBox.max.z], [-2, 2]);
});

QUnit.skip('sop/point with expression based on @Cd.r', () => {});
QUnit.skip('sop/point with expression based on @ptnum', () => {});
