import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3} from 'three';
export function testenginenodessopCSGExtrudeRectangular(qUnit: QUnit) {
	const tmpBox = new Box3();

	qUnit.test('sop/CSGExtrudeRectangular with non closed shapes', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const arc1 = geo1.createNode('CSGArc');
		const extrudeRectangular1 = geo1.createNode('CSGExtrudeRectangular');
		const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

		extrudeRectangular1.setInput(0, arc1);
		extrudeRectangular1.flags.display.set(true);
		CSGTriangulate1.setInput(0, extrudeRectangular1);

		async function computeExtrude() {
			const container = await extrudeRectangular1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			container.coreContent()!.boundingBox(tmpBox);

			return {allObjectsCount, threejsObjectsCount};
		}
		async function computeTriangulate() {
			const container = await CSGTriangulate1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

			container.coreContent()!.boundingBox(tmpBox);

			return {allObjectsCount, threejsObjectsCount, geometry};
		}
		await computeExtrude();
		assert.in_delta(tmpBox.min.x, -1.497, 0.002);

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			1260
		);
		assert.in_delta(tmpBox.min.x, -1.497, 0.002);
		assert.in_delta(tmpBox.max.x, 1.497, 0.002);
	});

	qUnit.test('sop/CSGExtrudeRectangular with closed shapes', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const circle1 = geo1.createNode('CSGCircle');
		const extrudeRectangular1 = geo1.createNode('CSGExtrudeRectangular');
		const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

		extrudeRectangular1.setInput(0, circle1);
		extrudeRectangular1.flags.display.set(true);
		CSGTriangulate1.setInput(0, extrudeRectangular1);

		async function computeExtrude() {
			const container = await extrudeRectangular1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			container.coreContent()!.boundingBox(tmpBox);

			return {allObjectsCount, threejsObjectsCount};
		}
		async function computeTriangulate() {
			const container = await CSGTriangulate1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

			container.coreContent()!.boundingBox(tmpBox);

			return {allObjectsCount, threejsObjectsCount, geometry};
		}
		await computeExtrude();
		assert.in_delta(tmpBox.min.x, -1.502, 0.002);

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			2304
		);
		assert.in_delta(tmpBox.min.x, -1.502, 0.002);
		assert.in_delta(tmpBox.max.x, 1.502, 0.002);
	});
}
