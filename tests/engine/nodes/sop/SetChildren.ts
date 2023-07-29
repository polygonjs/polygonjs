import type {QUnit} from '../../../helpers/QUnit';
import {Object3D} from 'three';
export function testenginenodessopSetChildren(qUnit: QUnit) {

qUnit.test('sop/setChildren simple', async (assert) => {
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

qUnit.test('sop/setChildren takes children one by one, and assigns all of them to a parent', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const copy1 = geo1.createNode('copy');
	const copy2 = geo1.createNode('copy');
	const setChildren1 = geo1.createNode('setChildren');

	copy1.setInput(0, box1);
	copy2.setInput(0, box1);
	setChildren1.setInput(0, copy1);
	setChildren1.setInput(1, copy2);
	copy1.p.count.set(2);
	copy2.p.count.set(3);

	const container = await setChildren1.compute();
	assert.ok(container);
	const objects = container.coreContent()!.threejsObjects();
	assert.equal(objects.length, 2);
	assert.equal(objects[0].children.length, 1);
	assert.equal(objects[1].children.length, 2);
});

qUnit.test('sop/setChildren can process empty inputs', async (assert) => {
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

}