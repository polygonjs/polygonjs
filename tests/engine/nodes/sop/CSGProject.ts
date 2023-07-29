import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3, Vector3} from 'three';
export function testenginenodessopCSGProject(qUnit: QUnit) {
const tmpBox = new Box3();
const tmpSize = new Vector3();

qUnit.test('sop/CSGProject', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const arc1 = geo1.createNode('CSGArc');
	// const expand1 = geo1.createNode('expand');
	const extrudeRotate1 = geo1.createNode('CSGExtrudeRotate');
	const project1 = geo1.createNode('CSGProject');
	const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

	// expand1.setInput(0, arc1);
	extrudeRotate1.setInput(0, arc1); //expand1);
	project1.setInput(0, extrudeRotate1);
	project1.flags.display.set(true);
	CSGTriangulate1.setInput(0, project1);

	async function computeProject() {
		const container = await project1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTriangulate() {
		const container = await CSGTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}

	await computeProject();
	assert.in_delta(tmpSize.x, 2, 0.1, 'size x');

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 54);
	assert.in_delta(tmpBox.min.x, -1, 0.002);
	assert.in_delta(tmpBox.max.x, 1, 0.002);
});

}