import {BufferAttribute, Box3, Vector3} from 'three';
const tmpBox = new Box3();
const tmpSize = new Vector3();

QUnit.test('sop/CADCurveTrim simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const circle1 = geo1.createNode('CADCircle');
	const curveTrim1 = geo1.createNode('CADCurveTrim');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	curveTrim1.setInput(0, circle1);
	CADTriangulate1.setInput(0, curveTrim1);

	curveTrim1.p.max.set(Math.PI);

	async function computeCurveFromPoints() {
		const container = await curveTrim1.compute();
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

	await computeCurveFromPoints();
	assert.in_delta(tmpBox.min.z, -1.0, 0.01);
	assert.in_delta(tmpSize.z, 1, 0.01);

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 96);
	assert.in_delta(tmpBox.min.z, -0.999, 0.01);
	assert.in_delta(tmpSize.z, 0.9995, 0.01);

	curveTrim1.p.max.set(0.25 * Math.PI);
	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 24);
	assert.in_delta(tmpBox.min.z, -0.7071, 0.01);
	assert.in_delta(tmpSize.z, 0.7071, 0.01);
});
