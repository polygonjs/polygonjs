import {Box3, Vector3} from 'three';
const tmpBox = new Box3();
const tmpSize = new Vector3();

QUnit.test('peak simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const peak1 = geo1.createNode('peak');
	peak1.p.amount.set(1);
	peak1.setInput(0, box1);

	async function getSize() {
		const container = await peak1.compute();
		container.coreContent()?.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);
		return tmpSize.toArray();
	}

	assert.equal((await getSize())[0], 3);
	assert.equal((await getSize())[1], 3);
	assert.equal((await getSize())[2], 3);

	peak1.p.amount.set(0.5);
	assert.equal((await getSize())[0], 2);
	assert.equal((await getSize())[1], 2);
	assert.equal((await getSize())[2], 2);
});
