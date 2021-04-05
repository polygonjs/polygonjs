import {ObjectType, objectTypeFromConstructor, AttribClass} from '../../../../src/core/geometry/Constant';

QUnit.test('SOP delete: (class=points) simple plane', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const delete1 = geo1.createNode('delete');
	delete1.setInput(0, plane1);
	delete1.p.byExpression.set(1);

	let container = await delete1.compute();
	assert.equal(container.pointsCount(), 3);

	// the points of one face remain if deleting a single point
	delete1.p.expression.set('@ptnum==0');
	container = await delete1.compute();
	assert.equal(container.pointsCount(), 3);

	// all 4 points removed if deleting one 2 of them, since that deletes both faces
	delete1.p.expression.set('@ptnum==1 || @ptnum==0');
	container = await delete1.compute();
	assert.equal(container.pointsCount(), 0);
});

QUnit.test('SOP delete: (class=points) simple box', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const delete1 = geo1.createNode('delete');
	delete1.setInput(0, box1);
	delete1.p.byExpression.set(1);

	let container = await box1.compute();
	assert.equal(container.pointsCount(), 24, 'box');

	container = await delete1.compute();
	assert.equal(container.pointsCount(), 33, 'after first delete'); // mm, I'd expect 21 instead. I could probably optimize the geometry creation from the kept points

	// only the top points remain
	delete1.p.expression.set('@P.y<0');
	container = await delete1.compute();
	assert.equal(container.pointsCount(), 6, 'after expression delete');
});

QUnit.test('SOP delete: (class=object) simple box', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const merge1 = geo1.createNode('merge');
	const delete1 = geo1.createNode('delete');

	merge1.setInput(0, box1);
	merge1.setInput(1, box2);
	merge1.p.compact.set(0);
	delete1.setInput(0, merge1);

	delete1.p.class.set(AttribClass.OBJECT);
	delete1.p.byExpression.set(1);
	delete1.p.expression.set('@ptnum==1');

	let container = await merge1.compute();
	let core_object = container.coreContent()!;
	assert.equal(core_object.coreObjects().length, 2);
	assert.equal(objectTypeFromConstructor(core_object.coreObjects()[0].object().constructor), ObjectType.MESH);
	assert.equal(objectTypeFromConstructor(core_object.coreObjects()[1].object().constructor), ObjectType.MESH);

	// now with keep_points on
	delete1.p.keepPoints.set(1);
	container = await delete1.compute();
	core_object = container.coreContent()!;
	assert.equal(core_object.coreObjects().length, 2);
	assert.equal(objectTypeFromConstructor(core_object.coreObjects()[0].object().constructor), ObjectType.MESH);
	assert.equal(objectTypeFromConstructor(core_object.coreObjects()[1].object().constructor), ObjectType.POINTS);

	// now with keep_points off
	delete1.p.keepPoints.set(0);
	container = await delete1.compute();
	core_object = container.coreContent()!;
	assert.equal(core_object.coreObjects().length, 1);
	assert.equal(objectTypeFromConstructor(core_object.coreObjects()[0].object().constructor), ObjectType.MESH);
});
