import type {QUnit} from '../../../helpers/QUnit';
import {BooleanCadOperationType} from '../../../../src/engine/nodes/sop/CADBoolean';
import {BufferAttribute, Box3, Vector3} from 'three';
export function testenginenodessopCADCone(qUnit: QUnit) {
const tmpBox = new Box3();
const tmpSize = new Vector3();

qUnit.test('sop/CADCone simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const cone1 = geo1.createNode('CADCone');
	const sphere1 = geo1.createNode('CADSphere');
	const boolean1 = geo1.createNode('CADBoolean');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	boolean1.setInput(0, cone1);
	boolean1.setInput(1, sphere1);
	sphere1.p.center.set([1, 0, 0]);
	boolean1.flags.display.set(true);
	boolean1.setOperation(BooleanCadOperationType.SUBTRACT);
	CADTriangulate1.setInput(0, boolean1);

	async function computeBoolean() {
		const container = await boolean1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTriangulate() {
		const container = await CADTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}

	await computeBoolean();
	assert.in_delta(tmpBox.min.x, -0.5, 0.01);
	assert.in_delta(tmpSize.x, 1.0, 0.01);

	assert.equal(
		((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
		4470
	);
	assert.in_delta(tmpBox.min.x, -0.499, 0.001);
	assert.in_delta(tmpSize.x, 0.6998, 0.01);

	cone1.p.topRadius.set(1);

	assert.equal(
		((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
		5412
	);
	assert.in_delta(tmpBox.min.x, -1, 0.01);
	assert.in_delta(tmpSize.x, 2, 0.01);
});

}