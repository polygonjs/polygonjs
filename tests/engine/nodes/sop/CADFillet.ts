import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3, Vector3} from 'three';
export function testenginenodessopCADFillet(qUnit: QUnit) {
	const tmpBox = new Box3();
	const tmpSize = new Vector3();

	qUnit.test('sop/CADFillet simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const box1 = geo1.createNode('CADBox');
		const transform1 = geo1.createNode('transform');
		const fillet1 = geo1.createNode('CADFillet');
		const CADTriangulate1 = geo1.createNode('CADTriangulate');

		transform1.setInput(0, box1);
		fillet1.setInput(0, transform1);
		CADTriangulate1.setInput(0, fillet1);

		transform1.p.r.y.set(45);

		async function computeFillet() {
			const container = await fillet1.compute();
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

		await computeFillet();
		assert.in_delta(tmpBox.min.x, -0.665, 0.01);
		assert.in_delta(tmpSize.x, 1.331, 0.01);

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			14232
		);
		assert.in_delta(tmpBox.min.x, -0.665, 0.01);
		assert.in_delta(tmpSize.x, 1.331, 0.01);

		fillet1.p.radius.set(0.4);
		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			16656
		);
		assert.in_delta(tmpBox.min.x, -0.541, 0.01);
		assert.in_delta(tmpSize.x, 1.08, 0.01);
	});
}
