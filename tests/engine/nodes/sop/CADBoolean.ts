import type {QUnit} from '../../../helpers/QUnit';
import {BooleanCadOperationType} from '../../../../src/engine/nodes/sop/CADBoolean';
import {Box3} from 'three';
import {CadObject} from '../../../../src/core/geometry/modules/cad/CadObject';
import {CadGeometryType} from '../../../../src/core/geometry/modules/cad/CadCommon';
export function testenginenodessopCADBoolean(qUnit: QUnit) {
	const tmpBox = new Box3();

	qUnit.test('sop/CADBoolean operations', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const tube1 = geo1.createNode('CADTube');
		const sphere1 = geo1.createNode('CADSphere');
		const boolean1 = geo1.createNode('CADBoolean');
		const CADTriangulate1 = geo1.createNode('CADTriangulate');
		const merge1 = geo1.createNode('merge');

		boolean1.setInput(0, tube1);
		boolean1.setInput(1, sphere1);
		boolean1.flags.display.set(true);

		CADTriangulate1.setInput(0, boolean1);
		merge1.setInput(0, CADTriangulate1);
		merge1.setCompactMode(true);

		sphere1.p.center.set([1, 0.5, 0]);

		async function computeBoolean() {
			const container = await boolean1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			const cadObjects = coreGroup.cadObjects()!;
			const cadObjectsTypes = cadObjects.map((o: CadObject<CadGeometryType>) => o.type);

			container.boundingBox(tmpBox);

			return {cadObjectsTypes, allObjectsCount, threejsObjectsCount};
		}
		async function computeTriangulate() {
			const container = await merge1.compute();
			const coreGroup = container.coreContent()!;
			const allObjectsCount = coreGroup.allObjects().length;
			const threejsObjectsCount = coreGroup.threejsObjects().length;

			const pointsCount = coreGroup?.pointsCount();

			container.boundingBox(tmpBox);

			return {allObjectsCount, threejsObjectsCount, pointsCount};
		}

		// union
		boolean1.setOperation(BooleanCadOperationType.UNION);
		await computeBoolean();
		assert.in_delta(tmpBox.min.x, -1.0, 0.01);
		assert.in_delta(tmpBox.max.x, 2.0, 0.01);
		assert.deepEqual((await computeBoolean()).cadObjectsTypes, [CadGeometryType.COMPOUND], 'types');

		assert.equal((await computeTriangulate()).pointsCount, 4586);
		assert.in_delta(tmpBox.min.x, -1, 0.01);
		assert.in_delta(tmpBox.max.x, 2, 0.01);

		// subtract
		boolean1.setOperation(BooleanCadOperationType.SUBTRACT);
		await computeBoolean();
		assert.in_delta(tmpBox.min.x, -1.0, 0.01);
		assert.in_delta(tmpBox.max.x, 0.625, 0.01);
		assert.deepEqual((await computeBoolean()).cadObjectsTypes, [CadGeometryType.COMPOUND], 'types');

		assert.equal((await computeTriangulate()).pointsCount, 1394);
		assert.in_delta(tmpBox.min.x, -1, 0.01);
		assert.in_delta(tmpBox.max.x, 0.625, 0.01);

		// intersect
		boolean1.setOperation(BooleanCadOperationType.INTERSECT);
		await computeBoolean();
		assert.in_delta(tmpBox.min.x, 0, 0.01);
		assert.in_delta(tmpBox.max.x, 1, 0.01);
		assert.deepEqual((await computeBoolean()).cadObjectsTypes, [CadGeometryType.COMPOUND], 'types');

		assert.equal((await computeTriangulate()).pointsCount, 1094);
		assert.in_delta(tmpBox.min.x, 0, 0.01);
		assert.in_delta(tmpBox.max.x, 1, 0.01);

		// section
		boolean1.setOperation(BooleanCadOperationType.SECTION);
		await computeBoolean();
		assert.in_delta(tmpBox.min.x, 0.13397, 0.01);
		assert.in_delta(tmpBox.max.x, 0.625, 0.01);
		assert.deepEqual((await computeBoolean()).cadObjectsTypes, [CadGeometryType.COMPOUND], 'types');

		assert.equal((await computeTriangulate()).pointsCount, 66);
		assert.in_delta(tmpBox.min.x, 0.13397, 0.01);
		assert.in_delta(tmpBox.max.x, 0.625, 0.01);
	});
}
