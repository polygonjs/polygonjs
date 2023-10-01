import type {QUnit} from '../../../helpers/QUnit';
import {Box3, Vector3} from 'three';
export function testenginenodessopJitter(qUnit: QUnit) {
	const tmpBox = new Box3();
	const tmpSize = new Vector3();

	qUnit.test('jitter simple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const scatter1 = geo1.createNode('scatter');
		const jitter1 = geo1.createNode('jitter');
		jitter1.setInput(0, scatter1);
		scatter1.setInput(0, plane1);

		let container = await jitter1.compute();
		container.coreContent()!.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		assert.more_than(tmpSize.x, 1.8);
		assert.more_than(tmpSize.y, 1.5);
		assert.more_than(tmpSize.z, 1.8);
	});

	qUnit.test('jitter with large y mult', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const scatter1 = geo1.createNode('scatter');
		const jitter1 = geo1.createNode('jitter');
		jitter1.setInput(0, scatter1);
		scatter1.setInput(0, plane1);
		jitter1.p.mult.y.set(10);

		let container = await jitter1.compute();
		container.coreContent()!.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		assert.more_than(tmpSize.x, 1.8);
		assert.more_than(tmpSize.y, 15);
		assert.more_than(tmpSize.z, 1.8);
	});

	qUnit.test('jitter with copy', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		plane1.p.size.set([4, 4]);
		const jitter1 = geo1.createNode('jitter');
		jitter1.setInput(0, plane1);

		const box1 = geo1.createNode('box');
		const copy1 = geo1.createNode('copy');

		copy1.setInput(0, box1);
		copy1.setInput(1, jitter1);
		jitter1.p.seed.set(56);

		let container = await copy1.compute();
		let objects = container.coreContent()!.threejsObjects();
		assert.in_delta(objects[0].position.x, -2.75, 0.1);
		assert.in_delta(objects[5].position.x, -1.93, 0.1);

		jitter1.p.amount.set(10);
		container = await copy1.compute();
		objects = container.coreContent()!.threejsObjects();
		assert.in_delta(objects[0].position.x, -9.52, 0.1);
		assert.in_delta(objects[5].position.x, -1.32, 0.1);

		jitter1.p.amount.set(100);
		container = await copy1.compute();
		objects = container.coreContent()!.threejsObjects();
		assert.in_delta(objects[0].position.x, -77.2, 0.1);
		assert.in_delta(objects[5].position.x, 4.74, 0.1);
	});
}
