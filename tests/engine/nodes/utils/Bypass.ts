import {Object3D, Vector3} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';

async function firstPos(node: BaseSopNodeType): Promise<Vector3> {
	const container = await node.compute();
	const coreGroup = container.coreContent()!;
	const object = coreGroup.objectsWithGeo()[0];
	const v = new Vector3();
	v.fromArray(object.geometry.attributes.position.array);
	return v;
}

QUnit.test('bypass flag simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const add1 = geo1.createNode('add');
	const transform1 = geo1.createNode('transform');
	const transform2 = geo1.createNode('transform');
	const dummy = geo1.createNode('add');
	dummy.flags.display.set(true);

	await scene.waitForCooksCompleted();
	transform1.setInput(0, add1);
	transform2.setInput(0, transform1);
	transform1.p.t.x.set(1);
	transform2.p.t.y.set(1);

	assert.deepEqual((await firstPos(add1)).toArray(), [0, 0, 0]);

	assert.deepEqual((await firstPos(transform2)).toArray(), [1, 1, 0]);
	assert.ok(!transform1.cookController.isCooking());
	assert.ok(!transform2.cookController.isCooking());

	transform1.flags.bypass.set(true);
	assert.deepEqual((await firstPos(transform2)).toArray(), [0, 1, 0]);
	assert.ok(!transform1.cookController.isCooking());
	assert.ok(!transform2.cookController.isCooking());

	transform2.flags.bypass.set(true);
	assert.deepEqual((await firstPos(transform2)).toArray(), [0, 0, 0]);
	// the sleep currently needs to be here
	// as there is a race condition where the node triggers a recook of itself.
	// I should investigate how the .endCook() method uses timestamps for that,
	// as well as how those timestamps are set
	await CoreSleep.sleep(100);
	assert.ok(!transform1.cookController.isCooking());
	assert.ok(!transform2.cookController.isCooking(), 'transform2 should not be cooking');

	transform1.flags.bypass.set(false);
	assert.deepEqual((await firstPos(transform2)).toArray(), [1, 0, 0]);
	await CoreSleep.sleep(100);
	assert.ok(!transform1.cookController.isCooking());
	assert.ok(!transform2.cookController.isCooking(), 'transform2 should not be cooking');

	transform2.flags.bypass.set(false);
	assert.deepEqual((await firstPos(transform2)).toArray(), [1, 1, 0]);
	assert.ok(!transform1.cookController.isCooking());
	assert.ok(!transform2.cookController.isCooking());
});

QUnit.test('bypass a node that has no input returns an empty container', async (assert) => {
	const geo1 = window.geo1;
	const spotlight1 = geo1.createNode('spotLight');
	const polarTransform1 = geo1.createNode('polarTransform');
	const hemisphereLight1 = geo1.createNode('hemisphereLight');
	const merge1 = geo1.createNode('merge');

	polarTransform1.setInput(0, spotlight1);
	merge1.setInput(0, polarTransform1);
	merge1.setInput(1, hemisphereLight1);

	let container = await merge1.compute();
	let objects = container.coreContent()!.objects();
	assert.notOk(merge1.states.error.active());
	assert.notOk(hemisphereLight1.states.error.active());
	assert.equal(objects.length, 2);
	assert.deepEqual(
		objects.map((o: Object3D) => o.name),
		['SpotLightContainer_spotLight1', 'hemisphereLight1']
	);

	hemisphereLight1.flags.bypass.set(true);
	container = await merge1.compute();
	objects = container.coreContent()!.objects();
	assert.notOk(merge1.states.error.active());
	assert.notOk(hemisphereLight1.states.error.active());
	assert.equal(objects.length, 1);
	assert.deepEqual(
		objects.map((o: Object3D) => o.name),
		['SpotLightContainer_spotLight1']
	);
});

QUnit.test('bypass a node that has no input but requires one sets the node as errored', async (assert) => {
	const geo1 = window.geo1;
	const spotlight1 = geo1.createNode('spotLight');
	const polarTransform1 = geo1.createNode('polarTransform');
	const hemisphereLight1 = geo1.createNode('hemisphereLight');
	const transform1 = geo1.createNode('transform');
	const merge1 = geo1.createNode('merge');

	polarTransform1.setInput(0, spotlight1);
	transform1.setInput(0, hemisphereLight1);
	merge1.setInput(0, polarTransform1);
	merge1.setInput(1, transform1);

	let container = await merge1.compute();
	assert.notOk(hemisphereLight1.states.error.active());
	assert.notOk(transform1.states.error.active());
	assert.notOk(merge1.states.error.active());
	assert.ok(container.coreContent());
	let objects = container.coreContent()!.objects();
	assert.equal(objects.length, 2);
	assert.deepEqual(
		objects.map((o: Object3D) => o.name),
		['SpotLightContainer_spotLight1', 'hemisphereLight1']
	);

	hemisphereLight1.flags.bypass.set(true);
	container = await merge1.compute();
	assert.notOk(hemisphereLight1.states.error.active(), 'hemisphere not errored');
	assert.ok(transform1.states.error.active(), 'transformed errored after bypassing hemisphereLight');
	assert.ok(merge1.states.error.active());
	assert.notOk(container.coreContent());

	transform1.flags.bypass.set(true);
	container = await merge1.compute();
	assert.notOk(hemisphereLight1.states.error.active());
	assert.notOk(transform1.states.error.active(), 'transformed NOT errored after bypassing transform');
	assert.notOk(merge1.states.error.active());
	assert.ok(container.coreContent());
	objects = container.coreContent()!.objects();
	assert.equal(objects.length, 1);
	assert.deepEqual(
		objects.map((o: Object3D) => o.name),
		['SpotLightContainer_spotLight1']
	);

	hemisphereLight1.flags.bypass.set(false);
	await CoreSleep.sleep(50); // TODO: ideally that should not be needed
	container = await merge1.compute();
	assert.notOk(hemisphereLight1.states.error.active());
	assert.notOk(transform1.states.error.active(), 'transformed NOT errored after un-bypassing hemisphereLight');
	assert.notOk(merge1.states.error.active());
	assert.ok(container.coreContent());
	objects = container.coreContent()!.objects();
	assert.equal(objects.length, 2);
	assert.deepEqual(
		objects.map((o: Object3D) => o.name),
		['SpotLightContainer_spotLight1', 'hemisphereLight1']
	);

	transform1.flags.bypass.set(false);
	container = await merge1.compute();
	assert.notOk(hemisphereLight1.states.error.active());
	assert.notOk(transform1.states.error.active(), 'transform NOT errored after un-bypassing transform');
	assert.notOk(merge1.states.error.active());
	assert.ok(container.coreContent());
	objects = container.coreContent()!.objects();
	assert.equal(objects.length, 2);
	assert.deepEqual(
		objects.map((o: Object3D) => o.name),
		['SpotLightContainer_spotLight1', 'hemisphereLight1']
	);

	hemisphereLight1.flags.bypass.set(true);
	transform1.flags.bypass.set(true);
	container = await merge1.compute();
	assert.notOk(hemisphereLight1.states.error.active());
	assert.notOk(transform1.states.error.active(), 'transform NOT errored after bypassing transform & hemisphereLight');
	assert.notOk(merge1.states.error.active());
	assert.ok(container.coreContent());
	objects = container.coreContent()!.objects();
	assert.equal(objects.length, 1);
	assert.deepEqual(
		objects.map((o: Object3D) => o.name),
		['SpotLightContainer_spotLight1']
	);

	transform1.flags.bypass.set(false);
	container = await merge1.compute();
	assert.notOk(hemisphereLight1.states.error.active(), 'transform errored after un-bypassing transform');
	assert.ok(transform1.states.error.active());
	assert.ok(merge1.states.error.active());
	assert.notOk(container.coreContent());
});
