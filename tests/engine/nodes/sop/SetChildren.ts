import {Object3D} from 'three';

QUnit.test('sop/setChildren simple', async (assert) => {
	const geo1 = window.geo1;

	const emptyObject1 = geo1.createNode('emptyObject');
	const box1 = geo1.createNode('box');
	const setChildren1 = geo1.createNode('setChildren');

	setChildren1.setInput(0, emptyObject1);
	setChildren1.setInput(1, box1);

	async function getChildrenCount(): Promise<number[]> {
		const container = await setChildren1.compute();

		const objects = container.coreContent()!.threejsObjects();
		return objects.map((object: Object3D) => object.children.length);
	}

	assert.deepEqual(await getChildrenCount(), [1]);

	const sphere1 = geo1.createNode('sphere');
	const setChildren2 = geo1.createNode('setChildren');
	setChildren2.setInput(0, setChildren1);
	setChildren2.setInput(1, sphere1);

	async function getChildrenCount2(): Promise<number[]> {
		const container = await setChildren2.compute();

		const objects = container.coreContent()!.threejsObjects();
		return objects.map((object: Object3D) => object.children.length);
	}
	assert.deepEqual(await getChildrenCount2(), [1]);

	setChildren2.p.clearExistingChildren.set(false);
	assert.deepEqual(await getChildrenCount2(), [2]);
});

QUnit.test('sop/setChildren can process empty inputs', async (assert) => {
	const geo1 = window.geo1;

	const null1 = geo1.createNode('null');
	const setChildren1 = geo1.createNode('setChildren');

	setChildren1.setInput(0, null1);
	setChildren1.setInput(1, null1);

	const container = await setChildren1.compute();
	assert.ok(container);
	const objects = container.coreContent()!.threejsObjects();
	assert.equal(objects.length, 0);
});
