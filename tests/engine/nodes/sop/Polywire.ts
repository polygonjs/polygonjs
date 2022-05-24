import {Vector3} from 'three';

QUnit.test('polywire simple', async (assert) => {
	const geo1 = window.geo1;

	const circle1 = geo1.createNode('circle');
	const polywire1 = geo1.createNode('polywire');

	polywire1.setInput(0, circle1);

	let container;

	container = await circle1.compute();
	assert.equal(container.pointsCount(), 12);
	const size = new Vector3();

	polywire1.p.closed.set(0);
	container = await polywire1.compute();
	assert.equal(container.pointsCount(), 192);
	assert.equal(container.boundingBox().getSize(size).y, 2, 'bbox');

	polywire1.p.closed.set(1);
	container = await polywire1.compute();
	assert.equal(container.pointsCount(), 208);
	assert.equal(container.boundingBox().getSize(size).y, 2, 'bbox');

	polywire1.p.radius.set(0.5);
	container = await polywire1.compute();
	assert.equal(container.pointsCount(), 208);
	assert.equal(container.boundingBox().getSize(size).y, 1, 'bbox');
});
