import {Matrix4} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('geo obj simple', async (assert) => {
	const scene = window.scene;
	const main_group = scene.threejsScene();
	assert.equal(main_group.name, '/');
	assert.equal(main_group.children.length, 2);
	assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

	const geo1 = window.geo1;
	const obj = main_group.children.filter((c) => c.name == '/geo1')[0];
	assert.equal(geo1.object.uuid, obj.uuid);

	window.scene.performance.start();
	assert.equal(geo1.cookController.cooksCount(), 0, 'should not have counted cooks yet');

	geo1.p.t.x.set(12);
	await scene.waitForCooksCompleted();
	assert.equal(geo1.cookController.cooksCount(), 1, 'should have cooked only once');
	assert.deepEqual(
		obj.matrix.toArray(),
		new Matrix4().makeTranslation(12, 0, 0).toArray(),
		'matrix is not what we expect'
	);

	window.scene.performance.stop();
});

QUnit.test('geo obj creates node sop on create', async (assert) => {
	const scene = window.scene;
	const geo2 = scene.root().createNode('geo');
	assert.equal(geo2.children().length, 0);
});

QUnit.test('geo obj is removed from scene when node is deleted', async (assert) => {
	const scene = window.scene;
	const main_group = scene.threejsScene();
	assert.equal(main_group.name, '/');
	assert.equal(main_group.children.length, 2);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/geo1:/perspectiveCamera1'
	);

	const geo1 = window.geo1;

	scene.root().removeNode(geo1);
	assert.equal(main_group.children.length, 1);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/perspectiveCamera1'
	);
});

QUnit.test('geo obj cooks only once when multiple params are updated', async (assert) => {
	const scene = window.scene;
	const main_group = scene.threejsScene();
	assert.equal(main_group.name, '/');
	assert.equal(main_group.children.length, 2);
	assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

	const geo1 = window.geo1;

	window.scene.performance.start();

	assert.equal(geo1.cookController.cooksCount(), 0);
	const obj = main_group.children.filter((c) => c.name == '/geo1')[0];
	scene.batchUpdates(() => {
		geo1.p.t.x.set(2);
		geo1.p.s.y.set(4);
	});
	await geo1.compute();
	assert.equal(geo1.object.uuid, obj.uuid);
	assert.deepEqual(
		obj.matrix.toArray(),
		new Matrix4().makeTranslation(2, 0, 0).multiply(new Matrix4().makeScale(1, 4, 1)).toArray(),
		'matrix is not what we expect'
	);
	assert.equal(geo1.cookController.cooksCount(), 1, 'cooks count should be 1');

	window.scene.performance.stop();
});

QUnit.test('geo obj: only the top group from a file sop with hierarchy is added to the geo object', async (assert) => {
	const scene = window.scene;
	const main_group = scene.threejsScene();
	assert.equal(main_group.name, '/');
	assert.equal(main_group.children.length, 2);
	assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

	const geo1 = window.geo1;

	const obj = main_group.children.filter((c) => c.name == '/geo1')[0];
	assert.ok(obj);
	assert.equal(obj.uuid, geo1.object.uuid);
	const file1 = geo1.createNode('fileOBJ');
	file1.p.url.set('/examples/models/wolf.obj');

	file1.flags.display.set(true);
	await scene.waitForCooksCompleted();
	await file1.compute();
	await CoreSleep.sleep(10);
	assert.equal(obj.children.length, 2);
	assert.equal(obj.children[1].children[0].children.length, 4);
});

QUnit.test('geo obj: $F in params will update the matrix', async (assert) => {
	const scene = window.scene;
	scene.performance.start();
	await scene.waitForCooksCompleted();
	const geo1 = window.geo1;
	assert.ok(geo1.isDirty(), 'geo1 is dirty');
	await geo1.compute();
	assert.notOk(geo1.isDirty(), 'geo1 is not dirty');
	scene.setFrame(1);
	scene.setFrame(3);
	assert.equal(geo1.cookController.cooksCount(), 1, 'cooked 1x');
	assert.notOk(geo1.isDirty(), 'geo1 is not dirty');
	geo1.p.r.y.set('$F+10');

	assert.ok(geo1.isDirty(), 'geo is dirty');
	await scene.waitForCooksCompleted();
	assert.equal(geo1.cookController.cooksCount(), 2, 'cooked 2x');
	assert.notOk(geo1.isDirty());
	assert.deepEqual(geo1.pv.r.toArray(), [0, 13, 0]);

	scene.setFrame(37);
	await scene.waitForCooksCompleted();
	assert.equal(geo1.cookController.cooksCount(), 3, 'cooked 3x');
	assert.notOk(geo1.isDirty());
	assert.deepEqual(geo1.pv.r.toArray(), [0, 47, 0]);

	window.scene.performance.stop();
});

QUnit.test('geo obj: display node can update and still inherit geo transform', async (assert) => {
	const geo1 = window.geo1;
	const box = geo1.createNode('box');

	geo1.p.t.x.set(10);
	await geo1.compute();
	await box.compute();

	await CoreSleep.sleep(100);

	let obj = box.containerController.container().coreContent()!.objects()[0];
	if (obj.matrixWorldNeedsUpdate) {
		// TODO: this isn't a great test.
		// maybe a better one would be to render one frame first?
		obj.updateWorldMatrix(true, true);
	}
	assert.equal(obj.matrixWorld.elements[12], 10);
});
