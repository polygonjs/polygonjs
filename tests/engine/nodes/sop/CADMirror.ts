import {BufferAttribute, Box3, Vector3} from 'three';
const tmpBox = new Box3();
const tmpSize = new Vector3();

QUnit.test('sop/CADMirror simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('CADBox');
	const mirror1 = geo1.createNode('CADMirror');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	mirror1.setInput(0, box1);
	CADTriangulate1.setInput(0, mirror1);

	box1.p.center.y.set(1);
	mirror1.p.axis.set([0, 0, 1]);

	async function computeMirror() {
		const container = await mirror1.compute();
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

	await computeMirror();
	assert.in_delta(tmpBox.min.y, -1.5, 0.01);
	assert.in_delta(tmpBox.max.y, -0.5, 0.01);

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 72);
	assert.in_delta(tmpBox.min.y, -1.5, 0.01);
	assert.in_delta(tmpBox.max.y, -0.5, 0.01);
});
