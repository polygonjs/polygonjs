import {Vector3} from 'three';

QUnit.test('sop/curveGetPoint simple', async (assert) => {
	const geo1 = window.geo1;

	const add1 = geo1.createNode('add');
	const add2 = geo1.createNode('add');
	const add3 = geo1.createNode('add');
	const add4 = geo1.createNode('add');
	const merge1 = geo1.createNode('merge');
	const curveFromPoints1 = geo1.createNode('curveFromPoints');
	const curveGetPoint1 = geo1.createNode('curveGetPoint');

	add1.p.position.set([0, 0, 0]);
	add2.p.position.set([2, 1, 3]);
	add3.p.position.set([12, 41, 62]);
	add4.p.position.set([-20, 120, -10]);

	merge1.setInput(0, add1);
	merge1.setInput(1, add2);
	merge1.setInput(2, add3);
	merge1.setInput(3, add4);
	merge1.setCompactMode(true);

	curveFromPoints1.setInput(0, merge1);
	curveGetPoint1.setInput(0, curveFromPoints1);

	let container = await curveGetPoint1.compute();
	let coreGroup = container.coreContent()!;
	assert.equal(coreGroup.pointsCount(), 1);
	let point = coreGroup.points()[0];
	let pos = point.getPosition(new Vector3());
	assert.in_delta(pos.x, 0, 0.1);
	assert.in_delta(pos.y, 0, 0.1);
	assert.in_delta(pos.z, 0, 0.1);

	curveGetPoint1.p.t.set(0.5);
	container = await curveGetPoint1.compute();
	coreGroup = container.coreContent()!;
	assert.equal(coreGroup.pointsCount(), 1);
	point = coreGroup.points()[0];
	pos = point.getPosition(new Vector3());
	assert.in_delta(pos.x, 9.125, 0.1);
	assert.in_delta(pos.y, 16.125, 0.1);
	assert.in_delta(pos.z, 37.1875, 0.1);
});
