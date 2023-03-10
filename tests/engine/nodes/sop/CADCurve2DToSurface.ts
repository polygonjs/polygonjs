import {BufferAttribute, Box3, Vector3} from 'three';
const tmpBox = new Box3();
const tmpSize = new Vector3();

QUnit.test('sop/CADCurve2DToSurface simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const circle1 = geo1.createNode('CADCircle2D');
	const sphere2 = geo1.createNode('CADSphere');
	const curve2DToSurface1 = geo1.createNode('CADCurve2DToSurface');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	curve2DToSurface1.setInput(0, circle1);
	curve2DToSurface1.setInput(1, sphere2);
	circle1.p.center.set([0, 1]);
	circle1.p.radius.set(0.1);
	CADTriangulate1.setInput(0, curve2DToSurface1);

	async function computeCurve2DToSurface1() {
		const container = await curve2DToSurface1.compute();
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

	await computeCurve2DToSurface1();
	assert.in_delta(tmpBox.min.y, 0.778, 0.01);
	assert.in_delta(tmpSize.y, 0.118, 0.01);

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 18);
	assert.in_delta(tmpBox.min.y, 0.7918, 0.01);
	assert.in_delta(tmpSize.y, 0.096, 0.01);

	circle1.p.radius.set(1);
	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 162);
	assert.in_delta(tmpBox.min.y, 0.0, 0.01);
	assert.in_delta(tmpSize.y, 0.999, 0.01);
});
