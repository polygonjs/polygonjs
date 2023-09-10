import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3, Vector3} from 'three';
import {CadGeometryType} from '../../../../src/core/geometry/modules/cad/CadCommon';
import {CadObject} from '../../../../src/core/geometry/modules/cad/CadObject';
export function testenginenodessopCADPointsFromCurve(qUnit: QUnit) {
	const tmpBox = new Box3();
	const tmpSize = new Vector3();

	qUnit.test('sop/CADPointsFromCurve simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const circle1 = geo1.createNode('CADCircle');
		const pointsFromCurve1 = geo1.createNode('CADPointsFromCurve');
		const CADTriangulate1 = geo1.createNode('CADTriangulate');
		const merge1 = geo1.createNode('merge');
		pointsFromCurve1.setInput(0, circle1);
		CADTriangulate1.setInput(0, pointsFromCurve1);
		merge1.setInput(0, CADTriangulate1);
		merge1.setCompactMode(true);

		async function computePointsFromCurve1() {
			const container = await pointsFromCurve1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;
			const cadObjects = coreGroup.cadObjects()!;
			const cadObjectsTypes = cadObjects.map((o: CadObject<CadGeometryType>) => o.type);

			container.boundingBox(tmpBox);
			tmpBox.getSize(tmpSize);

			return {cadObjectsTypes, allObjectsCount, threejsObjectsCount};
		}
		async function computeTriangulate() {
			const container = await merge1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

			container.boundingBox(tmpBox);
			tmpBox.getSize(tmpSize);

			return {allObjectsCount, threejsObjectsCount, geometry};
		}

		await computePointsFromCurve1();
		assert.in_delta(tmpBox.min.x, 0.999, 0.01);
		assert.in_delta(tmpBox.max.x, 0.999, 0.01);

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			1 * 3
		);
		assert.in_delta(tmpBox.min.x, 0.999, 0.01);
		assert.in_delta(tmpBox.max.x, 0.999, 0.01);

		pointsFromCurve1.p.max.set(2 * Math.PI);
		pointsFromCurve1.p.count.set(256);
		await computePointsFromCurve1();
		assert.in_delta(tmpBox.min.x, -1, 0.01);
		assert.in_delta(tmpBox.max.x, 1, 0.01);
		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			256 * 3
		);
		assert.in_delta(tmpBox.min.x, -1, 0.01);
		assert.in_delta(tmpBox.max.x, 1, 0.01);
	});
}
