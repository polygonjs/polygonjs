import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3} from 'three';
export function testenginenodessopCSGExtrudeLinear(qUnit: QUnit) {
	const tmpBox = new Box3();

	qUnit.test('sop/CSGExtrudeLinear with non closed shapes', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const arc1 = geo1.createNode('CSGArc');
		const extrudeLinear1 = geo1.createNode('CSGExtrudeLinear');

		extrudeLinear1.setInput(0, arc1);
		extrudeLinear1.flags.display.set(true);

		await extrudeLinear1.compute();

		assert.equal(
			extrudeLinear1.states.error.message(),
			`node internal error: 'Error: extruded path must be closed'.`
		);
	});

	qUnit.test('sop/CSGExtrudeLinear with closed shapes', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const circle1 = geo1.createNode('CSGCircle');
		const extrudeLinear1 = geo1.createNode('CSGExtrudeLinear');
		const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

		extrudeLinear1.setInput(0, circle1);
		extrudeLinear1.flags.display.set(true);
		CSGTriangulate1.setInput(0, extrudeLinear1);

		async function computeExtrude() {
			const container = await extrudeLinear1.compute();
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
		assert.in_delta(tmpBox.min.y, -1, 0.01);
		assert.in_delta(tmpBox.max.y, 1, 0.01);
		assert.in_delta(tmpBox.min.z, 0, 0.01);
		assert.in_delta(tmpBox.max.z, 0.5, 0.01);

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			1116
		);
		assert.in_delta(tmpBox.min.x, -1, 0.002);
		assert.in_delta(tmpBox.max.x, 1, 0.002);
		assert.in_delta(tmpBox.min.z, 0, 0.01);
		assert.in_delta(tmpBox.max.z, 0.5, 0.01);

		extrudeLinear1.p.height.set(2);
		await computeTriangulate();
		assert.in_delta(tmpBox.min.x, -1, 0.002);
		assert.in_delta(tmpBox.max.x, 1, 0.002);
		assert.in_delta(tmpBox.min.z, 0, 0.01);
		assert.in_delta(tmpBox.max.z, 2, 0.01);
	});
}
