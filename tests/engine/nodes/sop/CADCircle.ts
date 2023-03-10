import {BufferAttribute, Box3, Vector3} from 'three';
const tmpBox = new Box3();
const tmpSize = new Vector3();

QUnit.test('sop/CADCircle simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const circle1 = geo1.createNode('CADCircle');
	const circle2 = geo1.createNode('CADCircle');
	const merge1 = geo1.createNode('merge');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	merge1.setInput(0, circle1);
	merge1.setInput(1, circle2);
	circle1.p.axis.set([0, 1, 1]);
	CADTriangulate1.setInput(0, merge1);

	async function computeMerge() {
		const container = await merge1.compute();
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

	await computeMerge();
	assert.in_delta(tmpBox.min.y, -0.707, 0.01);
	assert.in_delta(tmpSize.y, 1.414, 0.01);

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 189);
	assert.in_delta(tmpBox.min.y, -0.707, 0.01);
	assert.in_delta(tmpSize.y, 1.414, 0.01);

	await computeTriangulate();
	assert.in_delta(tmpBox.min.y, -0.707, 0.01);
	assert.in_delta(tmpSize.y, 1.414, 0.01);
});
