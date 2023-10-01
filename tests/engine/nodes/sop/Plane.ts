import type {QUnit} from '../../../helpers/QUnit';
import {Box3} from 'three';
export function testenginenodessopPlane(qUnit: QUnit) {
	const tmpBox = new Box3();
	qUnit.test('sop/plane simple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');

		let container = await plane1.compute();
		container.coreContent()!.boundingBox(tmpBox);
		assert.equal(tmpBox.max.x, 0.5);
		assert.equal(tmpBox.min.x, -0.5);
	});

	qUnit.test('sop/plane with input', async (assert) => {
		const geo1 = window.geo1;
		const plane1 = geo1.createNode('plane');
		const sphere1 = geo1.createNode('sphere');
		plane1.setInput(0, sphere1);

		plane1.p.stepSize.set(0.1);
		let container = await plane1.compute();
		container.coreContent()!.boundingBox(tmpBox);
		assert.in_delta(tmpBox.max.x, 1, 0.1);
		assert.in_delta(tmpBox.min.x, -1, 0.1);
		assert.in_delta(tmpBox.max.z, 1, 0.1);
		assert.in_delta(tmpBox.min.z, -1, 0.1);
	});

	qUnit.test('sop/plane as lines', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		plane1.p.asLines.set(true);

		async function getIndex() {
			const container = await plane1.compute();
			const object = container.coreContent()!.threejsObjectsWithGeo()[0];
			return [...(object.geometry.getIndex()!.array as number[])];
		}

		let container = await plane1.compute();
		container.coreContent()!.boundingBox(tmpBox);
		assert.equal(tmpBox.max.x, 0.5);
		assert.equal(tmpBox.min.x, -0.5);
		assert.deepEqual(await getIndex(), [0, 2, 0, 1, 1, 3, 2, 3]);

		plane1.p.size.set([5, 8]);
		container = await plane1.compute();
		container.coreContent()!.boundingBox(tmpBox);
		assert.equal(tmpBox.max.x, 2.5);
		assert.equal(tmpBox.min.x, -2.5);
		assert.deepEqual(
			await getIndex(),
			[
				0, 6, 0, 1, 1, 7, 1, 2, 2, 8, 2, 3, 3, 9, 3, 4, 4, 10, 4, 5, 5, 11, 6, 12, 6, 7, 7, 13, 7, 8, 8, 14, 8,
				9, 9, 15, 9, 10, 10, 16, 10, 11, 11, 17, 12, 18, 12, 13, 13, 19, 13, 14, 14, 20, 14, 15, 15, 21, 15, 16,
				16, 22, 16, 17, 17, 23, 18, 24, 18, 19, 19, 25, 19, 20, 20, 26, 20, 21, 21, 27, 21, 22, 22, 28, 22, 23,
				23, 29, 24, 30, 24, 25, 25, 31, 25, 26, 26, 32, 26, 27, 27, 33, 27, 28, 28, 34, 28, 29, 29, 35, 30, 36,
				30, 31, 31, 37, 31, 32, 32, 38, 32, 33, 33, 39, 33, 34, 34, 40, 34, 35, 35, 41, 36, 42, 36, 37, 37, 43,
				37, 38, 38, 44, 38, 39, 39, 45, 39, 40, 40, 46, 40, 41, 41, 47, 42, 48, 42, 43, 48, 49, 43, 49, 43, 44,
				49, 50, 44, 50, 44, 45, 50, 51, 45, 51, 45, 46, 51, 52, 46, 52, 46, 47, 47, 53, 52, 53,
			]
		);
	});
}
