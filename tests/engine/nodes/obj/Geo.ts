import {Matrix4} from 'three/src/math/Matrix4';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three/src/core/BufferGeometry';

QUnit.test('geo obj simple', async (assert) => {
	const scene = window.scene;
	const main_group = scene.display_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(main_group.children[0].name, '/geo1');
	assert.equal(main_group.children[1].name, '/perspective_camera1');

	const geo1 = window.geo1;
	const obj = main_group.children[0];
	assert.equal(geo1.object.uuid, obj.uuid);

	window.scene.performance.start();
	assert.equal(geo1.cook_controller.cooks_count, 0, 'should not have counted cooks yet');

	geo1.p.t.x.set(12);
	await window.sleep(100);
	assert.equal(geo1.cook_controller.cooks_count, 1, 'should have cooked only once');
	assert.deepEqual(
		obj.matrix.toArray(),
		new Matrix4().makeTranslation(12, 0, 0).toArray(),
		'matrix is not what we expect'
	);

	window.scene.performance.stop();
});

QUnit.test('geo obj display flag off removes from scene', async (assert) => {
	const scene = window.scene;
	const main_group = scene.display_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/geo1:/perspective_camera1'
	);

	const geo1 = window.geo1;
	geo1.flags.display.set(false);
	assert.equal(main_group.children.length, 1);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/perspective_camera1'
	);
});

QUnit.test('geo obj display flag off does not cook', async (assert) => {
	const scene = window.scene;
	const main_group = scene.display_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(main_group.children[0].name, '/geo1');
	assert.equal(main_group.children[1].name, '/perspective_camera1');

	const geo1 = window.geo1;

	await window.sleep(10);
	geo1.flags.display.set(false);
	assert.equal(main_group.children.length, 1);

	window.scene.performance.start();

	assert.equal(geo1.cook_controller.cooks_count, 0);
	geo1.p.t.x.set(2);
	await window.sleep(100);
	assert.deepEqual(geo1.object.matrix.toArray(), new Matrix4().toArray(), 'matrix should be identity');
	assert.equal(geo1.cook_controller.cooks_count, 0, 'should not have cooked');

	window.scene.performance.stop();
});

QUnit.test('geo obj is removed from scene when node is deleted', async (assert) => {
	const scene = window.scene;
	const main_group = scene.display_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/geo1:/perspective_camera1'
	);

	const geo1 = window.geo1;

	scene.root.remove_node(geo1);
	assert.equal(main_group.children.length, 1);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/perspective_camera1'
	);
});

QUnit.test('geo obj cooks only once when multiple params are updated', async (assert) => {
	const scene = window.scene;
	const main_group = scene.display_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(main_group.children[0].name, '/geo1');
	assert.equal(main_group.children[1].name, '/perspective_camera1');

	const geo1 = window.geo1;

	window.scene.performance.start();

	assert.equal(geo1.cook_controller.cooks_count, 0);
	const obj = main_group.children[0];
	scene.batch_update(() => {
		geo1.p.t.x.set(2);
		geo1.p.s.y.set(4);
	});
	await window.sleep(100);
	assert.equal(geo1.object.uuid, obj.uuid);
	assert.deepEqual(
		obj.matrix.toArray(),
		new Matrix4()
			.makeTranslation(2, 0, 0)
			.multiply(new Matrix4().makeScale(1, 4, 1))
			.toArray(),
		'matrix is not what we expect'
	);
	assert.equal(geo1.cook_controller.cooks_count, 1, 'cooks count should be 1');

	window.scene.performance.stop();
});

QUnit.test('geo obj renders the child which has the display node', async (assert) => {
	const scene = window.scene;
	const main_group = scene.display_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(main_group.children[0].name, '/geo1');

	const geo1 = window.geo1;
	const obj = main_group.children[0];
	assert.equal(obj.uuid, geo1.object.uuid);
	const box1 = geo1.create_node('box');
	const plane1 = geo1.create_node('plane');

	// display the box
	box1.flags.display.set(true);
	await window.sleep(100);
	assert.equal(obj.children.length, 1);
	let geometry = (obj.children[0] as Mesh).geometry as BufferGeometry;
	assert.equal(geometry.getAttribute('position').array.length, 24 * 3);

	// display the plane
	plane1.flags.display.set(true);
	assert.notOk(box1.flags.display.active);
	await window.sleep(100);
	assert.equal(obj.children.length, 1);
	geometry = (obj.children[0] as Mesh).geometry as BufferGeometry;
	let positions = geometry.getAttribute('position').array;
	assert.equal(positions.length, 4 * 3);
	assert.equal(positions[0], -0.5);
	assert.equal(positions[1], 0.5);

	// update the plane
	plane1.p.size.set([2, 5]);
	await window.sleep(200);
	assert.equal(obj.children.length, 1);
	geometry = (obj.children[0] as Mesh).geometry as BufferGeometry;
	positions = geometry.getAttribute('position').array;
	assert.equal(positions[0], -1);
	assert.equal(positions[1], 2.5);
});

QUnit.test('geo obj: only the top group from a file sop with hierarchy is added to the geo object', async (assert) => {
	const scene = window.scene;
	const main_group = scene.display_scene.children[0];
	assert.equal(main_group.name, '_WORLD_');
	assert.equal(main_group.children.length, 2);
	assert.equal(main_group.children[0].name, '/geo1');

	const geo1 = window.geo1;
	const obj = main_group.children[0];
	assert.equal(obj.uuid, geo1.object.uuid);
	const file1 = geo1.create_node('file');
	file1.p.url.set('/examples/models/wolf.obj');

	file1.flags.display.set(true);
	await window.sleep(200);
	assert.equal(obj.children.length, 1);
	assert.equal(obj.children[0].children.length, 4);
});

QUnit.test('geo obj: $F in params will update the matrix', async (assert) => {
	window.scene.performance.start();
	await window.sleep(10);
	const geo1 = window.geo1;
	const scene = window.scene;
	console.log('check');
	assert.notOk(geo1.is_dirty, 'geo1 is not dirty');
	scene.set_frame(1);
	scene.set_frame(3);
	assert.equal(geo1.cook_controller.cooks_count, 0);
	assert.notOk(geo1.is_dirty, 'geo1 is not dirty');
	geo1.p.r.y.set('$F+10');

	assert.ok(geo1.is_dirty);
	await window.sleep(20);
	assert.equal(geo1.cook_controller.cooks_count, 1);
	assert.notOk(geo1.is_dirty);
	assert.deepEqual(geo1.pv.r.toArray(), [0, 13, 0]);

	scene.set_frame(37);
	await window.sleep(20);
	assert.equal(geo1.cook_controller.cooks_count, 2);
	assert.notOk(geo1.is_dirty);
	assert.deepEqual(geo1.pv.r.toArray(), [0, 47, 0]);

	window.scene.performance.stop();
});
