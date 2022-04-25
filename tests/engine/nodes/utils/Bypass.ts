import {Vector3} from 'three';
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
