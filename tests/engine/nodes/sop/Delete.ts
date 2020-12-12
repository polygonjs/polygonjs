import {ObjectType, object_type_from_constructor, AttribClass} from '../../../../src/core/geometry/Constant';

QUnit.test('SOP delete: (class=points) simple plane', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const delete1 = geo1.createNode('delete');
	delete1.set_input(0, plane1);
	delete1.p.by_expression.set(1);

	let container = await delete1.request_container();
	assert.equal(container.points_count(), 3);

	// the points of one face remain if deleting a single point
	delete1.p.expression.set('@ptnum==0');
	container = await delete1.request_container();
	assert.equal(container.points_count(), 3);

	// all 4 points removed if deleting one 2 of them, since that deletes both faces
	delete1.p.expression.set('@ptnum==1 || @ptnum==0');
	container = await delete1.request_container();
	assert.equal(container.points_count(), 0);
});

QUnit.test('SOP delete: (class=points) simple box', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const delete1 = geo1.createNode('delete');
	delete1.set_input(0, box1);
	delete1.p.by_expression.set(1);

	let container = await box1.request_container();
	assert.equal(container.points_count(), 24, 'box');

	container = await delete1.request_container();
	assert.equal(container.points_count(), 33, 'after first delete'); // mm, I'd expect 21 instead. I could probably optimize the geometry creation from the kept points

	// only the top points remain
	delete1.p.expression.set('@P.y<0');
	container = await delete1.request_container();
	assert.equal(container.points_count(), 6, 'after expression delete');
});

QUnit.test('SOP delete: (class=object) simple box', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const merge1 = geo1.createNode('merge');
	const delete1 = geo1.createNode('delete');

	merge1.set_input(0, box1);
	merge1.set_input(1, box2);
	merge1.p.compact.set(0);
	delete1.set_input(0, merge1);

	delete1.p.class.set(AttribClass.OBJECT);
	delete1.p.by_expression.set(1);
	delete1.p.expression.set('@ptnum==1');

	let container = await merge1.request_container();
	let core_object = container.core_content()!;
	assert.equal(core_object.core_objects().length, 2);
	assert.equal(object_type_from_constructor(core_object.core_objects()[0].object().constructor), ObjectType.MESH);
	assert.equal(object_type_from_constructor(core_object.core_objects()[1].object().constructor), ObjectType.MESH);

	// now with keep_points on
	delete1.p.keep_points.set(1);
	container = await delete1.request_container();
	core_object = container.core_content()!;
	assert.equal(core_object.core_objects().length, 2);
	assert.equal(object_type_from_constructor(core_object.core_objects()[0].object().constructor), ObjectType.MESH);
	assert.equal(object_type_from_constructor(core_object.core_objects()[1].object().constructor), ObjectType.POINTS);

	// now with keep_points off
	delete1.p.keep_points.set(0);
	container = await delete1.request_container();
	core_object = container.core_content()!;
	assert.equal(core_object.core_objects().length, 1);
	assert.equal(object_type_from_constructor(core_object.core_objects()[0].object().constructor), ObjectType.MESH);
});
