import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3} from 'three';
export function testenginenodessopCSGExtrudeRotate(qUnit: QUnit) {
const tmpBox = new Box3();

qUnit.test('sop/CSGExtrudeRotate with non closed shapes', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const arc1 = geo1.createNode('CSGArc');
	const extrudeRotate1 = geo1.createNode('CSGExtrudeRotate');
	const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

	extrudeRotate1.setInput(0, arc1);
	extrudeRotate1.flags.display.set(true);
	CSGTriangulate1.setInput(0, extrudeRotate1);

	async function computeExtrude() {
		const container = await extrudeRotate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.boundingBox(tmpBox);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTriangulate() {
		const container = await CSGTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}
	await computeExtrude();
	assert.in_delta(tmpBox.min.x, -1, 0.002);

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 54);
	assert.in_delta(tmpBox.min.x, -1, 0.002);
	assert.in_delta(tmpBox.max.x, 1, 0.002);
	assert.in_delta(tmpBox.min.y, 0, 0.002);
	assert.in_delta(tmpBox.max.y, 0, 0.002);
});

qUnit.test('sop/CSGExtrudeRotate with closed shapes', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const circle1 = geo1.createNode('CSGCircle');
	const extrudeRotate1 = geo1.createNode('CSGExtrudeRotate');
	const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

	extrudeRotate1.setInput(0, circle1);
	extrudeRotate1.flags.display.set(true);
	CSGTriangulate1.setInput(0, extrudeRotate1);

	async function computeExtrude() {
		const container = await extrudeRotate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.boundingBox(tmpBox);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTriangulate() {
		const container = await CSGTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}
	await computeExtrude();
	assert.in_delta(tmpBox.min.x, -1, 0.002);

	assert.equal(
		((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
		4320
	);
	assert.in_delta(tmpBox.min.x, -1, 0.002);
	assert.in_delta(tmpBox.max.x, 1, 0.002);
	assert.in_delta(tmpBox.min.y, -1, 0.002);
	assert.in_delta(tmpBox.max.y, 1, 0.002);
});

}