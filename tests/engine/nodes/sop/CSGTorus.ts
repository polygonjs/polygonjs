import type {QUnit} from '../../../helpers/QUnit';
import {BooleanCsgOperationType} from '../../../../src/engine/nodes/sop/CSGBoolean';
import {BufferAttribute, Box3, Vector3} from 'three';
export function testenginenodessopCSGTorus(qUnit: QUnit) {
	const tmpBox = new Box3();
	const tmpSize = new Vector3();

	qUnit.test('sop/CSGTorus simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const torus1 = geo1.createNode('CSGTorus');
		const sphere1 = geo1.createNode('CSGSphere');
		const boolean1 = geo1.createNode('CSGBoolean');
		const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

		boolean1.setInput(0, sphere1);
		boolean1.setInput(1, torus1);
		torus1.p.innerRadius.set(0.1);
		torus1.p.outerRadius.set(1);
		boolean1.flags.display.set(true);
		boolean1.setOperation(BooleanCsgOperationType.SUBTRACT);
		CSGTriangulate1.setInput(0, boolean1);

		async function computeBoolean() {
			const container = await boolean1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			container.coreContent()!.boundingBox(tmpBox);
			tmpBox.getSize(tmpSize);

			return {allObjectsCount, threejsObjectsCount};
		}
		async function computeTriangulate() {
			const container = await CSGTriangulate1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

			container.coreContent()!.boundingBox(tmpBox);
			tmpBox.getSize(tmpSize);

			return {allObjectsCount, threejsObjectsCount, geometry};
		}

		await computeBoolean();
		assert.in_delta(tmpSize.x, 1.96, 0.1, 'size x');

		assert.equal(
			((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
			5760
		);
		assert.in_delta(tmpBox.min.y, -0.981, 0.002);
	});
}
