import type {QUnit} from '../../../helpers/QUnit';
import {ConversionMode} from '../../../../src/engine/nodes/sop/CADConvertDimension';
import {BufferAttribute, Box3, Vector3} from 'three';
export function testenginenodessopCADEllipse2D(qUnit: QUnit) {
	const tmpBox = new Box3();
	const tmpSize = new Vector3();

	qUnit.test('sop/CADEllipseD simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const ellipse2D1 = geo1.createNode('CADEllipse2D');
		const convertDimension1 = geo1.createNode('CADConvertDimension');
		const extrude1 = geo1.createNode('CADExtrude');
		const CADTriangulate1 = geo1.createNode('CADTriangulate');

		convertDimension1.setInput(0, ellipse2D1);
		extrude1.setInput(0, convertDimension1);
		CADTriangulate1.setInput(0, extrude1);

		convertDimension1.setMode(ConversionMode.TO_3D);
		extrude1.p.dir.set([0, 0, 1]);

		async function computeMerge() {
			const container = await extrude1.compute();
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
		assert.in_delta(tmpBox.min.y, -1, 0.01);
		assert.in_delta(tmpSize.y, 2, 0.01);

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			960
		);
		assert.in_delta(tmpBox.min.y, -1, 0.01);
		assert.in_delta(tmpSize.y, 2, 0.01);

		ellipse2D1.p.minorRadius.set(2);

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			948
		);
		assert.in_delta(tmpBox.min.y, -0.9998, 0.01);
		assert.in_delta(tmpSize.y, 1.999, 0.01);
	});
}
