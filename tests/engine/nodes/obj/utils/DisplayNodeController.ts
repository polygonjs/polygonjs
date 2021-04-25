import {Matrix4} from 'three/src/math/Matrix4';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {CoreSleep} from '../../../../../src/core/Sleep';

QUnit.test('geo obj display flag off does not cook', async (assert) => {
	window.scene.performance.start();

	const scene = window.scene;
	const main_group = scene.threejsScene();
	assert.equal(main_group.name, '/');
	assert.equal(main_group.children.length, 2);
	assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

	const geo1 = window.geo1;
	assert.equal(geo1.children().length, 0);
	const box1 = geo1.createNode('box');
	assert.ok(box1.flags.display.active(), 'display flag is set on');
	assert.equal(geo1.displayNodeController.displayNode()?.graphNodeId(), box1.graphNodeId(), 'display node is box');
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(10);
	assert.equal(
		geo1.childrenDisplayController.sopGroup().children[0].uuid,
		box1.containerController.container().coreContent()?.objects()[0].uuid
	);

	assert.equal(box1.cookController.cooks_count, 1);
	box1.p.size.set(box1.pv.size * 2);
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(10);
	assert.equal(box1.cookController.cooks_count, 2, 'box has cooked once more');
	assert.ok(geo1.childrenDisplayController.sopGroup().visible);

	geo1.flags.display.set(false);
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(10);

	box1.p.size.set(box1.pv.size * 2);
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(10);
	assert.equal(box1.cookController.cooks_count, 2, 'box has not cooked again');
	assert.ok(!geo1.childrenDisplayController.sopGroup().visible);

	assert.equal(main_group.children.length, 2);

	assert.equal(geo1.cookController.cooks_count, 0, 'cooks count is 0');
	geo1.p.t.x.set(2);
	await scene.waitForCooksCompleted();
	assert.deepEqual(
		geo1.object.matrix.toArray(),
		new Matrix4().makeTranslation(2, 0, 0).toArray(),
		'matrix should be translated'
	);
	assert.equal(geo1.cookController.cooks_count, 1, 'should have cooked once');

	window.scene.performance.stop();
});

QUnit.test('geo obj display flag off removes from scene', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
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
	assert.ok(geo1.childrenDisplayController.sopGroup().visible);
	assert.equal(main_group.children.find((o) => o.name == '/geo1')?.children.length, 2);

	geo1.flags.display.set(false);
	assert.equal(main_group.children.length, 2);
	assert.equal(
		main_group.children
			.map((c) => c.name)
			.sort()
			.join(':'),
		'/geo1:/perspectiveCamera1'
	);
	assert.equal(main_group.children.find((o) => o.name == '/geo1')?.children.length, 1);
	assert.ok(!geo1.childrenDisplayController.sopGroup().visible);
});

QUnit.test('geo obj display flag off does not cook its content on load', async (assert) => {
	window.scene.performance.start();

	const scene = window.scene;
	const geo1 = window.geo1;

	geo1.flags.display.set(false);

	const box1 = geo1.createNode('box');
	await scene.waitForCooksCompleted();
	assert.ok(box1.flags.display.active(), 'display flag is set on');
	assert.equal(geo1.displayNodeController.displayNode()?.graphNodeId(), box1.graphNodeId(), 'display node is box');
	assert.equal(box1.cookController.cooks_count, 0, 'box has not cooked');
	assert.equal(geo1.childrenDisplayController.sopGroup().children.length, 0, 'sop_group is empty');

	box1.p.size.set(box1.pv.size * 2);
	await scene.waitForCooksCompleted();
	assert.equal(box1.cookController.cooks_count, 0, 'box has still not cooked');

	geo1.flags.display.set(true);
	await scene.waitForCooksCompleted();
	assert.equal(box1.cookController.cooks_count, 1);
	assert.equal(
		geo1.childrenDisplayController.sopGroup().children[0].uuid,
		box1.containerController.container().coreContent()?.objects()[0].uuid
	);
});

QUnit.test('geo obj renders the child which has the display node', async (assert) => {
	const scene = window.scene;
	const main_group = scene.threejsScene();
	assert.equal(main_group.name, '/');
	assert.equal(main_group.children.length, 2);
	assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

	const geo1 = window.geo1;
	const obj = main_group.children.filter((c) => c.name == '/geo1')[0];
	assert.equal(obj.uuid, geo1.object.uuid);
	const box1 = geo1.createNode('box');
	const plane1 = geo1.createNode('plane');

	// display the box
	box1.flags.display.set(true);
	await scene.waitForCooksCompleted();
	await box1.compute();
	await plane1.compute();
	await CoreSleep.sleep(20);
	assert.equal(obj.children.length, 2, 'obj has 2 children');
	assert.deepEqual(
		obj.children.map((c) => c.name).sort(),
		['/geo1:parented_outputs', 'geo1:sop_group'],
		'object contains a hierarchy parent and a sop group'
	);
	console.log('obj', obj);
	let geometry = (obj.children[1].children[0] as Mesh).geometry as BufferGeometry;
	assert.equal(geometry.getAttribute('position').array.length, 24 * 3);

	// display the plane
	plane1.flags.display.set(true);
	assert.notOk(box1.flags.display.active());
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(20);
	assert.equal(obj.children.length, 2);
	geometry = (obj.children[1].children[0] as Mesh).geometry as BufferGeometry;
	let positions = geometry.getAttribute('position').array;
	assert.equal(positions.length, 4 * 3);
	assert.equal(positions[0], -0.5);
	assert.equal(positions[2], -0.5, 'y position');

	// update the plane
	plane1.p.size.set([2, 5]);
	await scene.waitForCooksCompleted();
	await CoreSleep.sleep(20);
	assert.equal(obj.children.length, 2);
	geometry = (obj.children[1].children[0] as Mesh).geometry as BufferGeometry;
	positions = geometry.getAttribute('position').array;
	assert.equal(positions[0], -1);
	assert.equal(positions[2], -2.5, 'y position');
});
