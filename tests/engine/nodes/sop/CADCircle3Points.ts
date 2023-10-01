import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3, Vector3} from 'three';
export function testenginenodessopCADCircle3Points(qUnit: QUnit) {
	const tmpBox = new Box3();
	const tmpSize = new Vector3();

	qUnit.test('sop/CADCircle3Points simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const point1 = geo1.createNode('CADPoint');
		const transform1 = geo1.createNode('transform');
		const transform2 = geo1.createNode('CADTransform');
		const merge1 = geo1.createNode('merge');
		const circle3Points1 = geo1.createNode('CADCircle3Points');
		const CADTriangulate1 = geo1.createNode('CADTriangulate');

		transform1.setInput(0, point1);
		transform2.setInput(0, point1);
		merge1.setInput(0, point1);
		merge1.setInput(1, transform1);
		merge1.setInput(2, transform2);
		circle3Points1.setInput(0, merge1);
		CADTriangulate1.setInput(0, circle3Points1);

		transform1.p.t.set([1, 1, 1]);
		transform2.p.t.set([0, 1, 1]);

		async function computeMerge() {
			const container = await circle3Points1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			container.coreContent()!.boundingBox(tmpBox);
			tmpBox.getSize(tmpSize);

			return {allObjectsCount, threejsObjectsCount};
		}
		async function computeTriangulate() {
			const container = await CADTriangulate1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

			container.coreContent()!.boundingBox(tmpBox);
			tmpBox.getSize(tmpSize);

			return {allObjectsCount, threejsObjectsCount, geometry};
		}

		await computeMerge();
		assert.in_delta(tmpBox.min.y, -0.112, 0.01);
		assert.in_delta(tmpSize.y, 1.224, 0.01);

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			114
		);
		assert.in_delta(tmpBox.min.y, -0.111, 0.01);
		assert.in_delta(tmpSize.y, 1.224, 0.01);

		transform2.p.t.set([0, 2, 1]);

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			108
		);
		assert.in_delta(tmpBox.min.y, -0.02, 0.01);
		assert.in_delta(tmpSize.y, 2.02, 0.01);
	});
}
