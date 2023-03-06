import {RaySopMode} from '../../../../src/engine/operations/sop/Ray';
import {Box3, Vector3} from 'three';
const tmpBox = new Box3();
const tmpSize = new Vector3();

QUnit.test('ray from normal', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const sphere1 = geo1.createNode('sphere');
	const transform1 = geo1.createNode('transform');
	const ray1 = geo1.createNode('ray');

	transform1.p.scale.set(0.2);

	transform1.setInput(0, sphere1);
	ray1.setInput(0, transform1);
	ray1.setInput(1, box1);

	async function getSize() {
		const container = await ray1.compute();
		container.coreContent()?.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);
		return tmpSize.toArray();
	}
	assert.in_delta((await getSize())[0], 1, 0.1);
	assert.in_delta((await getSize())[1], 1, 0.1);
	assert.in_delta((await getSize())[2], 1, 0.1);
});

QUnit.test('ray from dir', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const sphere1 = geo1.createNode('sphere');
	const transform1 = geo1.createNode('transform');
	const transform2 = geo1.createNode('transform');
	const ray1 = geo1.createNode('ray');

	transform1.p.t.y.set(2);
	transform2.p.scale.set(5);
	ray1.p.useNormals.set(0);

	transform1.setInput(0, sphere1);
	transform2.setInput(0, plane1);
	ray1.setInput(0, transform1);
	ray1.setInput(1, transform2);

	async function getSize() {
		const container = await ray1.compute();
		container.coreContent()?.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);
		return tmpSize.toArray();
	}

	assert.in_delta((await getSize())[0], 2, 0.1);
	assert.in_delta((await getSize())[1], 0, 0.1);
	assert.in_delta((await getSize())[2], 2, 0.1);
});

QUnit.test('ray with min dist creates a bvh if none given', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const scatter1 = geo1.createNode('scatter');

	const sphere1 = geo1.createNode('sphere');
	const ray1 = geo1.createNode('ray');

	plane1.p.center.set([0, 2, 0]);
	plane1.p.size.set([8, 8]);
	scatter1.setInput(0, plane1);
	ray1.setMode(RaySopMode.MIN_DIST);
	ray1.setInput(0, scatter1);
	ray1.setInput(1, sphere1);

	async function getSize() {
		const container = await ray1.compute();
		container.coreContent()?.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);
		return tmpSize.toArray();
	}
	assert.in_delta((await getSize())[0], 1.7, 0.1);
	assert.in_delta((await getSize())[1], 0.6, 0.1);
	assert.in_delta((await getSize())[2], 1.68, 0.1);
});
