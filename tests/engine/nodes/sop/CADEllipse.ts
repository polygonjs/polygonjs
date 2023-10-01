import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3, Vector3} from 'three';
export function testenginenodessopCADEllipse(qUnit: QUnit) {
	const tmpBox = new Box3();
	const tmpSize = new Vector3();

	qUnit.test('sop/CADEllipse simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const ellipse1 = geo1.createNode('CADEllipse');
		const ellipse2 = geo1.createNode('CADEllipse');
		const merge1 = geo1.createNode('merge');
		const CADTriangulate1 = geo1.createNode('CADTriangulate');

		merge1.setInput(0, ellipse1);
		merge1.setInput(1, ellipse2);
		ellipse1.p.axis.set([0, 1, 1]);
		CADTriangulate1.setInput(0, merge1);

		ellipse1.p.majorRadius.set(0.5);
		ellipse2.p.majorRadius.set(0.5);

		async function computeMerge() {
			const container = await merge1.compute();
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
		assert.in_delta(tmpBox.min.y, -0.353, 0.01);
		assert.in_delta(tmpSize.y, 0.707, 0.01);

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			147
		);
		assert.in_delta(tmpBox.min.y, -0.353, 0.01);
		assert.in_delta(tmpSize.y, 0.706, 0.01);

		ellipse1.p.majorRadius.set(1);
		ellipse2.p.majorRadius.set(1);
		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			189
		);
		assert.in_delta(tmpBox.min.y, -0.707, 0.01);
		assert.in_delta(tmpSize.y, 1.413, 0.01);
	});
}
