import type {QUnit} from '../../../helpers/QUnit';
import {BooleanCadOperationType} from '../../../../src/engine/nodes/sop/CADBoolean';
import {BufferAttribute, Box3} from 'three';
export function testenginenodessopCADTorus(qUnit: QUnit) {
const tmpBox = new Box3();

qUnit.test('sop/CADTorus simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const torus1 = geo1.createNode('CADTorus');
	const sphere1 = geo1.createNode('CADSphere');
	const boolean1 = geo1.createNode('CADBoolean');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	boolean1.setInput(0, sphere1);
	boolean1.setInput(1, torus1);
	boolean1.flags.display.set(true);
	boolean1.setOperation(BooleanCadOperationType.INTERSECT);
	CADTriangulate1.setInput(0, boolean1);

	async function computeBoolean() {
		const container = await boolean1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.coreContent()!.boundingBox(tmpBox);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTriangulate() {
		const container = await CADTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.coreContent()!.boundingBox(tmpBox);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}

	await computeBoolean();
	assert.in_delta(tmpBox.min.x, -1.082, 0.01);

	assert.equal(
		((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
		25215
	);
	assert.in_delta(tmpBox.min.x, -0.999, 0.001);
});

}